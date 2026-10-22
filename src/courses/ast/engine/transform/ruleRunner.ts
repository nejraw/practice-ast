import type * as ESTree from "estree";
import { childrenOf } from "@/courses/ast/engine/tree/children";
import { parseProgram, type Positioned } from "@/courses/ast/engine/parsing/parse";
import { lineAt } from "@/courses/ast/engine/parsing/position";
import { applyEdits, type Edit } from "./edits";

/**
 * Runs a lint rule written in ESLint's shape against some code. A small,
 * honest subset of ESLint: node-type visitors (also with `:exit`), `node.parent`,
 * `context.report()` with `message` or `messageId` and `data` placeholders,
 * `context.sourceCode.getText()` and five fixer methods. No selectors, options or scope.
 */

export interface Report {
  start: number;
  end: number;
  line: number;
  message: string;
  fix?: Edit[];
}

export type RuleOutcome =
  | { ok: true; reports: Report[] }
  | { ok: false; where: "rule" | "code"; message: string };

type Visitor = Record<string, ((node: ESTree.Node) => void) | undefined>;
interface Rule {
  meta?: { fixable?: string; messages?: Record<string, string> };
  create: (context: unknown) => Visitor;
}

const fixer = {
  replaceText: (node: Positioned, text: string): Edit => ({ start: node.start, end: node.end, replacement: text }),
  replaceTextRange: ([start, end]: [number, number], text: string): Edit => ({ start, end, replacement: text }),
  insertTextBefore: (node: Positioned, text: string): Edit => ({ start: node.start, end: node.start, replacement: text }),
  insertTextAfter: (node: Positioned, text: string): Edit => ({ start: node.end, end: node.end, replacement: text }),
  remove: (node: Positioned): Edit => ({ start: node.start, end: node.end, replacement: "" }),
};

/** A fix may return one edit, a list, or (as in ESLint) yield them from a generator. */
function fixEdits(result: unknown): Edit[] {
  if (result === null || result === undefined) return [];
  const edits =
    typeof result === "object" && Symbol.iterator in result ? [...(result as Iterable<unknown>)] : [result];
  for (const edit of edits) {
    const { start, end, replacement } = (edit ?? {}) as Partial<Edit>;
    if (typeof start !== "number" || typeof end !== "number" || typeof replacement !== "string") {
      throw new Error("A fix must return what the fixer makes, such as fixer.replaceText(node, text).");
    }
  }
  const sorted = (edits as Edit[]).toSorted((a, b) => a.start - b.start);
  if (sorted.some((edit, i) => i > 0 && edit.start < sorted[i - 1].end)) {
    throw new Error("The edits of one fix must not overlap, as ESLint requires.");
  }
  return sorted;
}

/** Turns the rule's source into a rule object. The source must assign it to `const rule`. */
function compileRule(source: string): Rule {
  const rule = new Function(`"use strict";\n${source}\n;return typeof rule === "undefined" ? undefined : rule;`)() as Rule | undefined;
  if (!rule || typeof rule.create !== "function") throw new Error("Define `const rule = { create(context) { … } }`.");
  return rule;
}

export function runRule(ruleSource: string, code: string): RuleOutcome {
  let rule: Rule;
  try {
    rule = compileRule(ruleSource);
  } catch (error) {
    return { ok: false, where: "rule", message: (error as Error).message };
  }
  const parsed = parseProgram(code);
  if (!parsed.ok) return { ok: false, where: "code", message: `${parsed.message} (line ${parsed.line})` };

  const reports: Report[] = [];
  const context = {
    sourceCode: { text: code, getText: (node?: Positioned) => (node ? code.slice(node.start, node.end) : code) },
    report({
      node,
      message: text,
      messageId,
      data,
      fix,
    }: {
      node: Positioned;
      message?: string;
      messageId?: string;
      data?: Record<string, unknown>;
      fix?: (f: typeof fixer) => unknown;
    }) {
      if (messageId !== undefined && rule.meta?.messages?.[messageId] === undefined) {
        throw new Error(`context.report() used messageId "${messageId}", which is not in meta.messages.`);
      }
      const message = messageId !== undefined ? rule.meta!.messages![messageId] : text;
      if (!node || typeof message !== "string") throw new Error("context.report() needs a node and a message or messageId.");
      if (fix && rule.meta?.fixable === undefined) throw new Error("Rules with fixes must set meta.fixable, as ESLint requires.");
      // A fix that returns null or no edits means "no fix", as in ESLint.
      const edits = fix ? fixEdits(fix(fixer)) : [];
      reports.push({
        start: node.start,
        end: node.end,
        line: lineAt(code, node.start),
        message: message.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => (data && key in data ? String(data[key]) : match)),
        fix: edits.length ? edits : undefined,
      });
    },
  };

  // ESLint links every node to its parent before any rule runs; rules use it all the time.
  const link = (node: Positioned) => {
    for (const child of childrenOf(node)) {
      (child.node as Positioned & { parent?: Positioned }).parent = node;
      link(child.node);
    }
  };
  link(parsed.ast);

  try {
    const visitor = rule.create(context);
    const visit = (node: Positioned) => {
      visitor[node.type]?.(node as ESTree.Node);
      for (const child of childrenOf(node)) visit(child.node);
      visitor[`${node.type}:exit`]?.(node as ESTree.Node);
    };
    visit(parsed.ast);
  } catch (error) {
    return { ok: false, where: "rule", message: (error as Error).message };
  }
  return { ok: true, reports };
}

/** Applies every fix that doesn't overlap one before it; overlapping fixes are skipped. */
export function applyFixes(code: string, reports: Report[]): string {
  const chosen: Edit[] = [];
  let end = -1;
  // Each fix's edits are sorted and don't overlap (see fixEdits), so a fix spans its first start to its last end.
  for (const edits of reports.flatMap((report) => (report.fix ? [report.fix] : [])).sort((a, b) => a[0].start - b[0].start)) {
    if (edits[0].start < end) continue;
    chosen.push(...edits);
    end = edits[edits.length - 1].end;
  }
  return applyEdits(code, chosen);
}
