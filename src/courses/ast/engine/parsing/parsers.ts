import type * as ESTree from "estree";
import { childrenOf } from "@/courses/ast/engine/tree/children";
import { parseProgram, type Positioned } from "./parse";
import { withoutPosition } from "./position";

/**
 * The same code through three real parsers, flattened to an outline so the
 * trees can be compared side by side. Babel and TypeScript are loaded only
 * when needed: TypeScript's parser alone is several megabytes.
 */

export type ParserId = "acorn" | "babel" | "typescript";
export type Language = "js" | "ts" | "jsx";

export interface OutlineRow {
  label: string;
  /** A name, value or operator that makes the row recognizable. */
  detail?: string;
  start: number;
  end: number;
  depth: number;
}

/** A tree, a syntax error, or (for TypeScript, which recovers) both. */
export interface ParserOutcome {
  rows: OutlineRow[] | null;
  error?: string;
}

function estreeDetail(node: Record<string, unknown>): string | undefined {
  if (typeof node.name === "string") return node.name;
  if (typeof node.operator === "string") return node.operator;
  if (node.type === "VariableDeclaration") return node.kind as string;
  if (typeof node.raw === "string") return node.raw;
  const extra = node.extra as { raw?: string } | undefined;
  if (extra?.raw) return extra.raw;
  return undefined;
}

function outlineEstree(root: Positioned): OutlineRow[] {
  const rows: OutlineRow[] = [];
  const visit = (node: Positioned, depth: number) => {
    rows.push({ label: node.type, detail: estreeDetail(node as never), start: node.start, end: node.end, depth });
    for (const child of childrenOf(node as ESTree.Node)) visit(child.node, depth + 1);
  };
  visit(root, 0);
  return rows;
}

// Acorn parses standard JavaScript only, so it stops at the first type annotation or JSX tag.
async function parseAcorn(code: string): Promise<ParserOutcome> {
  const result = parseProgram(code);
  return result.ok ? { rows: outlineEstree(result.ast) } : { rows: null, error: `${result.message} (line ${result.line})` };
}

async function parseBabel(code: string, language: Language): Promise<ParserOutcome> {
  const { parse } = await import("@babel/parser");
  try {
    const plugins = language === "ts" ? (["typescript"] as const) : language === "jsx" ? (["jsx"] as const) : [];
    const file = parse(code, { sourceType: "module", plugins: [...plugins] });
    return { rows: outlineEstree(file as unknown as Positioned) };
  } catch (error) {
    const line = (error as { loc?: { line: number } }).loc?.line;
    const message = withoutPosition((error as Error).message);
    return { rows: null, error: line === undefined ? message : `${message} (line ${line})` };
  }
}

let kindNames: string[] | undefined;

async function parseTypeScript(code: string, language: Language): Promise<ParserOutcome> {
  const ts = (await import("typescript5")).default;
  // SyntaxKind also has aliases like FirstStatement; keep the real name of each kind.
  kindNames ??= Object.entries(ts.SyntaxKind).reduce<string[]>((names, [name, value]) => {
    if (typeof value === "number" && !/^(First|Last)/.test(name)) names[value] ??= name;
    return names;
  }, []);
  const names = kindNames;
  const kind = language === "ts" ? ts.ScriptKind.TS : language === "jsx" ? ts.ScriptKind.JSX : ts.ScriptKind.JS;
  const file = ts.createSourceFile(`input.${language}`, code, ts.ScriptTarget.Latest, true, kind);

  const rows: OutlineRow[] = [];
  const visit = (node: import("typescript5").Node, depth: number) => {
    const text = ts.isIdentifier(node) || ts.isLiteralExpression(node) ? node.getText(file) : undefined;
    rows.push({ label: names[node.kind] ?? String(node.kind), detail: text, start: node.getStart(file), end: node.end, depth });
    node.forEachChild((child) => visit(child, depth + 1));
  };
  visit(file, 0);

  // TypeScript never throws: it always builds a tree and lists the problems separately.
  // `parseDiagnostics` isn't public API (the public route type-checks a whole program),
  // so a TypeScript version without it just shows no error.
  const problems = (file as unknown as { parseDiagnostics?: import("typescript5").DiagnosticWithLocation[] }).parseDiagnostics ?? [];
  const [first] = problems;
  if (!first) return { rows };
  const line = file.getLineAndCharacterOfPosition(first.start).line + 1;
  return { rows, error: `${ts.flattenDiagnosticMessageText(first.messageText, "\n")} (line ${line})` };
}

export const parsers: Array<{ id: ParserId; name: string; run: (code: string, language: Language) => Promise<ParserOutcome> }> = [
  { id: "acorn", name: "acorn", run: parseAcorn },
  { id: "babel", name: "@babel/parser", run: parseBabel },
  { id: "typescript", name: "typescript", run: parseTypeScript },
];
