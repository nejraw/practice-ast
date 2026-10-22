import { parse as acornParse } from "acorn";
import { generate } from "astring";
import type * as ESTree from "estree";
import * as recast from "recast";
import { withoutPosition } from "@/courses/ast/engine/parsing/position";
import { tokenize } from "@/courses/ast/engine/parsing/tokens";
import { BOOKKEEPING_KEYS } from "@/courses/ast/engine/tree/children";

/**
 * Code → tree → changed tree → code, with two ways back to text: recast,
 * which reprints only the nodes that changed, and astring, which prints the
 * whole tree from scratch.
 */

type Node = ESTree.Node & { loc?: { start: { line: number } } };

export interface Transform {
  id: string;
  label: string;
  /** Changes the tree in place and returns a description of each change. */
  apply: (program: ESTree.Program) => string[];
}

const lineOf = (node: ESTree.Node) => (node as Node).loc?.start.line ?? 0;

/**
 * Visits every node, parents first. Not `walk` from tree/walk.ts, which only
 * follows nodes with positions: nodes a transform creates have none.
 */
function visit(node: ESTree.Node, enter: (node: ESTree.Node) => void) {
  enter(node);
  for (const [key, value] of Object.entries(node)) {
    if (BOOKKEEPING_KEYS.has(key)) continue;
    if (Array.isArray(value)) value.forEach((child) => child && typeof child.type === "string" && visit(child, enter));
    else if (value && typeof value === "object" && typeof (value as ESTree.Node).type === "string") visit(value as ESTree.Node, enter);
  }
}

const isConsoleLog = (node: ESTree.Node) =>
  node.type === "ExpressionStatement" &&
  node.expression.type === "CallExpression" &&
  node.expression.callee.type === "MemberExpression" &&
  node.expression.callee.object.type === "Identifier" &&
  node.expression.callee.object.name === "console" &&
  node.expression.callee.property.type === "Identifier" &&
  node.expression.callee.property.name === "log";

export const transforms: Transform[] = [
  {
    id: "var-to-let",
    label: "var → let",
    apply(program) {
      const changes: string[] = [];
      visit(program, (node) => {
        if (node.type === "VariableDeclaration" && node.kind === "var") {
          node.kind = "let";
          changes.push(`line ${lineOf(node)}: a VariableDeclaration's kind changed from "var" to "let".`);
        }
      });
      return changes;
    },
  },
  {
    id: "remove-console-log",
    label: "remove console.log",
    apply(program) {
      const changes: string[] = [];
      visit(program, (node) => {
        for (const key of ["body", "consequent"] as const) {
          const list = (node as unknown as Record<string, unknown>)[key];
          if (!Array.isArray(list)) continue;
          const kept = list.filter((statement: ESTree.Node) => {
            if (!isConsoleLog(statement)) return true;
            changes.push(`line ${lineOf(statement)}: an ExpressionStatement calling console.log was removed from its parent's ${key}.`);
            return false;
          });
          (node as unknown as Record<string, unknown>)[key] = kept;
        }
      });
      return changes;
    },
  },
  {
    id: "square",
    label: "x ** 2 → x * x",
    apply(program) {
      const changes: string[] = [];
      visit(program, (node) => {
        if (
          node.type === "BinaryExpression" &&
          node.operator === "**" &&
          node.right.type === "Literal" &&
          node.right.value === 2 &&
          node.left.type === "Identifier"
        ) {
          node.operator = "*";
          node.right = stripPositions(node.left as ESTree.Expression);
          changes.push(`line ${lineOf(node)}: a BinaryExpression's operator changed from "**" to "*", and its right side became a copy of its left.`);
        }
      });
      return changes;
    },
  },
];

/** A fresh deep copy without positions, so printers treat it as new code. */
function stripPositions<T extends ESTree.Node>(node: T): T {
  return JSON.parse(
    JSON.stringify(node, (key, value) => (["loc", "start", "end", "range", "original", "comments"].includes(key) ? undefined : value)),
  );
}

// Recast needs the comments and tokens on the tree to reprint changed nodes with their comments.
const parser = {
  parse(source: string) {
    const comments: unknown[] = [];
    const tokens: unknown[] = [];
    const program = acornParse(source, {
      ecmaVersion: "latest",
      sourceType: "module",
      locations: true,
      ranges: true,
      onComment: comments as [],
      onToken: tokens as [],
    });
    return Object.assign(program, { comments, tokens });
  },
};

export type TransformOutcome =
  | { ok: true; changes: string[]; reprinted: string; regenerated: string }
  | { ok: false; message: string };

export function runTransform(code: string, transformId: string): TransformOutcome {
  const transform = transforms.find((candidate) => candidate.id === transformId);
  if (!transform) return { ok: false, message: `Unknown transform ${transformId}` };
  let file: { program: ESTree.Program };
  try {
    file = recast.parse(code, { parser }) as unknown as { program: ESTree.Program };
  } catch (error) {
    return { ok: false, message: withoutPosition((error as Error).message) };
  }
  const changes = transform.apply(file.program);
  return {
    ok: true,
    changes,
    reprinted: recast.print(file as never).code,
    regenerated: generate(file.program),
  };
}

/** How many comments survive, and how many lines are exactly as they were. */
export function compareToSource(source: string, output: string) {
  // Ask the tokenizer, so a "//" inside a string or URL isn't counted as a comment.
  const countComments = (text: string) =>
    tokenize(text).pieces.filter((piece) => piece.kind === "skipped" && piece.what === "comment").length;
  const outputLines = output.split("\n").filter((line) => line.trim());
  return {
    comments: countComments(output),
    sourceComments: countComments(source),
    unchangedLines: unchangedLines(source, output).filter(Boolean).length,
    lines: outputLines.length,
  };
}

/**
 * For each line of `output`, whether it appears character for character in
 * `source`. Each source line can vouch for one output line only, so ten
 * printed `}` lines don't all count as written when the source had two.
 * Blank lines are left out of the count: they are `false`.
 */
export function unchangedLines(source: string, output: string): boolean[] {
  const available = new Map<string, number>();
  for (const line of source.split("\n")) available.set(line, (available.get(line) ?? 0) + 1);
  return output.split("\n").map((line) => {
    const left = available.get(line) ?? 0;
    if (!line.trim() || left === 0) return false;
    available.set(line, left - 1);
    return true;
  });
}
