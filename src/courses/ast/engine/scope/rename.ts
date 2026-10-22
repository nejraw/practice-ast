import type * as ESTree from "estree";
import type { Positioned } from "@/courses/ast/engine/parsing/parse";
import type { Edit } from "@/courses/ast/engine/transform/edits";
import { walk, type WalkContext } from "@/courses/ast/engine/tree/walk";

export interface ClassifiedEdit extends Edit {
  correct: boolean;
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** What a careful find-and-replace does: whole words only. */
export function textRename(code: string, from: string, to: string): Edit[] {
  if (!from) return [];
  const pattern = new RegExp(`(?<![\\w$])${escapeRegExp(from)}(?![\\w$])`, "g");
  return [...code.matchAll(pattern)].map((match) => ({
    start: match.index,
    end: match.index + from.length,
    replacement: to,
  }));
}

/** Identifiers that are names of *properties* (or of exports, labels and `import.meta`), not variables. */
function isPropertyName({ parent, key }: WalkContext): boolean {
  if (!parent) return false;
  switch (parent.type) {
    case "MemberExpression":
      return key === "property" && !parent.computed;
    case "Property":
    case "MethodDefinition":
    case "PropertyDefinition":
      // A shorthand `{ count }` has a key and a value at the same place; the value is the variable.
      return key === "key" && !parent.computed;
    case "ImportSpecifier":
      return key === "imported";
    case "ExportSpecifier":
      return key === "exported";
    case "ExportAllDeclaration":
      return key === "exported";
    case "MetaProperty":
      return true;
    case "LabeledStatement":
    case "BreakStatement":
    case "ContinueStatement":
      return key === "label";
    default:
      return false;
  }
}

/**
 * Where one name is both a property (or import/export) name and a variable, only
 * the variable may change, so the shorthand is expanded. Keyed by the variable's
 * start offset; each entry turns (old name, new name) into the replacement text.
 */
export function shorthandExpansions(ast: Positioned<ESTree.Program>): Map<number, (from: string, to: string) => string> {
  const expansions = new Map<number, (from: string, to: string) => string>();
  walk(ast, (node) => {
    // `{ count }` and `{ count = 1 }`: the value (or the default's target) starts where the key does.
    if (node.type === "Property" && node.shorthand) {
      expansions.set((node.value as Positioned).start, (from, to) => `${from}: ${to}`);
    } else if (node.type === "ImportSpecifier" && (node.imported as Positioned).start === (node.local as Positioned).start) {
      expansions.set((node.local as Positioned).start, (from, to) => `${from} as ${to}`);
    } else if (node.type === "ExportSpecifier" && (node.local as Positioned).start === (node.exported as Positioned).start) {
      expansions.set((node.local as Positioned).start, (from, to) => `${to} as ${from}`);
    }
  });
  return expansions;
}

/**
 * Renames every identifier that refers to a *variable* called `from`.
 * Deliberately not scope-aware: a shadowing variable with the same name is
 * renamed too. Lesson 6 fixes that with scope analysis (see scope.ts).
 */
export function astRename(ast: Positioned<ESTree.Program>, from: string, to: string): Edit[] {
  const expansions = shorthandExpansions(ast);
  const edits: Edit[] = [];
  walk(ast, (node, context) => {
    if (node.type !== "Identifier" || node.name !== from || isPropertyName(context)) return;
    edits.push({ start: node.start, end: node.end, replacement: expansions.get(node.start)?.(from, to) ?? to });
  });
  return edits;
}

/** Marks each text edit as correct only when the AST-based rename agrees with it. */
export function classifyTextEdits(textEdits: Edit[], astEdits: Edit[]): ClassifiedEdit[] {
  return textEdits.map((edit) => ({
    ...edit,
    correct: astEdits.some(
      (other) => other.start === edit.start && other.end === edit.end && other.replacement === edit.replacement,
    ),
  }));
}
