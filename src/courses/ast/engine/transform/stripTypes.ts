import { parse as acornParse } from "acorn";
import { withoutPosition, type Span } from "@/courses/ast/engine/parsing/position";
import { childrenOf } from "@/courses/ast/engine/tree/children";

/**
 * Type stripping the way Node.js does it: find every piece of TypeScript-only
 * syntax in the tree and replace it with spaces, so every remaining character
 * stays at the line and column where it was written. Syntax that would need
 * new JavaScript to be generated (an enum, for example) is refused instead.
 *
 * For comparison it also builds the "removed" version, where the types are
 * cut out entirely, with a map from each output offset back to the source.
 */

export type StripOutcome =
  | {
      ok: true;
      /** The TypeScript-only parts of the source. */
      ranges: Span[];
      /** Types replaced by spaces: same length, same lines, same columns. */
      blanked: string;
      /** Types cut out, with emptied lines dropped. */
      removed: string;
      /** For every offset in `removed` (plus its end), the offset in the source it came from. */
      removedToSource: number[];
    }
  | { ok: false; message: string; unsupported: Span[] };

interface BabelNode {
  type: string;
  start: number;
  end: number;
  [key: string]: unknown;
}

/** Whole statements that only exist for the type checker. */
const TYPE_ONLY_STATEMENTS = new Set(["TSInterfaceDeclaration", "TSTypeAliasDeclaration", "TSDeclareFunction"]);

/** Parts of a node that are nothing but types. */
const TYPE_PARTS = new Set(["TSTypeAnnotation", "TSTypeParameterDeclaration", "TSTypeParameterInstantiation"]);

/** Why each of these can't simply be erased: it has a value at runtime. */
const NEEDS_CODE: Record<string, string> = {
  TSEnumDeclaration: "an enum creates an object at runtime",
  TSModuleDeclaration: "a namespace with values creates an object at runtime",
  TSParameterProperty: "a parameter property assigns to this.<name> at runtime",
  TSImportEqualsDeclaration: "import = becomes a require() call or a variable",
  TSExportAssignment: "export = becomes module.exports",
};

const isDeclared = (node: BabelNode) => node.declare === true;

/** A namespace that only declares types can be erased like an interface. */
function isTypeOnlyNamespace(node: BabelNode): boolean {
  const body = node.body as BabelNode | undefined;
  if (!body) return true;
  if (body.type === "TSModuleDeclaration") return isTypeOnlyNamespace(body);
  return (body.body as BabelNode[]).every((statement) => {
    const inner = statement.type === "ExportNamedDeclaration" ? (statement.declaration as BabelNode | null) : statement;
    return !!inner && (TYPE_ONLY_STATEMENTS.has(inner.type) || isDeclared(inner));
  });
}

function isErasableStatement(node: BabelNode): boolean {
  if (TYPE_ONLY_STATEMENTS.has(node.type) || isDeclared(node)) return true;
  if (node.type === "TSModuleDeclaration") return isTypeOnlyNamespace(node);
  if (node.type === "ImportDeclaration" || node.type === "ExportNamedDeclaration") {
    if (node.importKind === "type" || node.exportKind === "type") return true;
  }
  if (node.type === "ExportNamedDeclaration" && node.declaration) return isErasableStatement(node.declaration as BabelNode);
  return false;
}

const children = (node: BabelNode) => childrenOf(node as never).map((child) => child.node as unknown as BabelNode);

/** Nodes with a parameter list, where a leading `this: Type` parameter is only for the type checker. */
const FUNCTIONS = new Set(["FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression", "ClassMethod", "ClassPrivateMethod", "ObjectMethod"]);

/** Finds the type-only ranges, or the first construct that would need code to be generated. */
function findTypeRanges(code: string, program: BabelNode): { ranges: Span[]; unsupported: Array<Span & { why: string }> } {
  const ranges: Span[] = [];
  const unsupported: Array<Span & { why: string }> = [];
  const strip = (start: number, end: number) => end > start && ranges.push({ start, end });
  /** Strips one character, such as the `?` or `!` after a name, searching from `from`. */
  const stripChar = (char: string, from: number, to: number) => {
    const at = code.indexOf(char, from);
    if (at !== -1 && at < to) strip(at, at + 1);
  };
  /** Strips modifier keywords like `private readonly` at the start of a node. */
  const stripModifiers = (node: BabelNode) => {
    const match = /^(?:(?:public|private|protected|readonly|override|abstract)\s+)+/.exec(code.slice(node.start, node.end));
    if (match) strip(node.start, node.start + match[0].length);
  };

  // Parts already stripped as a whole, so nothing inside them is visited.
  const erased = new Set<BabelNode>();

  const visit = (node: BabelNode) => {
    if (erased.has(node)) return;
    if (NEEDS_CODE[node.type] && !isDeclared(node) && !(node.type === "TSModuleDeclaration" && isTypeOnlyNamespace(node))) {
      unsupported.push({ start: node.start, end: node.end, why: NEEDS_CODE[node.type] });
      return;
    }
    // An abstract property, like an abstract method, is a promise about subclasses: no field is created.
    const abstractMember = (node.type === "ClassProperty" || node.type === "ClassAccessorProperty") && node.abstract === true;
    if (isErasableStatement(node) || TYPE_PARTS.has(node.type) || node.type === "TSDeclareMethod" || abstractMember) {
      strip(node.start, node.end);
      return;
    }

    if (FUNCTIONS.has(node.type)) {
      const [first, second] = (node.params as BabelNode[]) ?? [];
      if (first?.type === "Identifier" && first.name === "this") {
        // `this: Window, ` goes up to the next parameter, so the list stays valid.
        const comma = /^\s*,/.exec(code.slice(first.end));
        strip(first.start, second ? second.start : first.end + (comma ? comma[0].length : 0));
        erased.add(first);
      }
    }

    switch (node.type) {
      case "TSAsExpression":
      case "TSSatisfiesExpression":
      case "TSNonNullExpression":
        // Keep the value, drop what follows it: ` as T`, ` satisfies T`, `!`.
        strip((node.expression as BabelNode).end, node.end);
        break;
      case "ImportSpecifier":
      case "ExportSpecifier":
        if (node.importKind === "type" || node.exportKind === "type") {
          // `type B,` goes, comma included, so the list stays valid.
          const comma = /^\s*,/.exec(code.slice(node.end));
          strip(node.start, node.end + (comma ? comma[0].length : 0));
          return;
        }
        break;
      case "ClassDeclaration":
      case "ClassExpression": {
        if (node.abstract) stripModifiers(node);
        const implemented = (node.implements as BabelNode[] | undefined) ?? [];
        if (implemented.length) {
          const keyword = code.lastIndexOf("implements", implemented[0].start);
          strip(keyword, implemented[implemented.length - 1].end);
        }
        break;
      }
      case "ClassProperty":
      case "ClassMethod":
        stripModifiers(node);
        if (node.definite) stripChar("!", (node.key as BabelNode).end, node.end);
        if (node.optional) stripChar("?", (node.key as BabelNode).end, node.end);
        break;
      case "Identifier":
        if (node.optional) stripChar("?", node.start + (node.name as string).length, node.end);
        break;
    }
    for (const child of children(node)) visit(child);
  };

  visit(program);
  return { ranges: ranges.sort((a, b) => a.start - b.start), unsupported };
}

function blank(code: string, ranges: Span[]): string {
  let out = "";
  let at = 0;
  for (const { start, end } of ranges) {
    if (start < at) continue;
    out += code.slice(at, start) + code.slice(start, end).replace(/[^\r\n]/g, " ");
    at = end;
  }
  return out + code.slice(at);
}

/**
 * Cuts the ranges out, line by line. A line that had code and is left with
 * only spaces goes entirely, and so do spaces left at the end of a line.
 */
function remove(code: string, ranges: Span[]): { removed: string; removedToSource: number[] } {
  const inRange = (offset: number) => ranges.some((range) => range.start <= offset && offset < range.end);
  let removed = "";
  const removedToSource: number[] = [];
  let lineStart = 0;
  for (const line of code.split("\n")) {
    const kept: number[] = [];
    for (let i = lineStart; i < lineStart + line.length; i++) if (!inRange(i)) kept.push(i);
    while (kept.length && /\s/.test(code[kept[kept.length - 1]])) kept.pop();
    const newline = lineStart + line.length;
    lineStart = newline + 1;
    if (kept.length === 0 && line.trim() !== "") continue;
    for (const i of kept) {
      removed += code[i];
      removedToSource.push(i);
    }
    if (newline < code.length) {
      removed += "\n";
      removedToSource.push(newline);
    }
  }
  removedToSource.push(code.length);
  return { removed, removedToSource };
}

export async function stripTypes(code: string): Promise<StripOutcome> {
  const { parse } = await import("@babel/parser");
  let program: BabelNode;
  try {
    program = parse(code, { sourceType: "module", plugins: ["typescript"] }).program as unknown as BabelNode;
  } catch (error) {
    return { ok: false, message: withoutPosition((error as Error).message), unsupported: [] };
  }

  const { ranges, unsupported } = findTypeRanges(code, program);
  if (unsupported.length) {
    return {
      ok: false,
      message: `This needs code generated, not just types erased: ${unsupported[0].why}.`,
      unsupported,
    };
  }

  const blanked = blank(code, ranges);
  // Anything this small stripper doesn't know would still be TypeScript; better to say so.
  try {
    acornParse(blanked, { ecmaVersion: "latest", sourceType: "module" });
  } catch (error) {
    return { ok: false, message: `This figure doesn't know how to strip everything here (${(error as Error).message}).`, unsupported: [] };
  }
  return { ok: true, ranges, blanked, ...remove(code, ranges) };
}
