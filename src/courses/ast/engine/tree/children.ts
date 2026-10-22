import type * as ESTree from "estree";
import type { Positioned } from "@/courses/ast/engine/parsing/parse";

/**
 * ESTree has no uniform `children` array: children live in named fields
 * (`left`, `body`, `params`...). `fieldsOf` gives every consumer one ordered
 * view of a node's fields, in the order the parser created them.
 */
export type Field =
  | { key: string; kind: "node"; node: Positioned }
  | { key: string; kind: "list"; items: (Positioned | null)[] }
  | { key: string; kind: "value"; value: unknown };

export interface ChildRef {
  key: string;
  index?: number;
  node: Positioned;
}

/**
 * Bookkeeping added by a parser or printer, not part of the language's structure:
 * positions, `parent` (added by the rule runner), the comments and recovered errors
 * Babel attaches, and recast's `original` and `tokens`. Every tree walker skips these.
 */
export const BOOKKEEPING_KEYS = new Set([
  "type",
  "start",
  "end",
  "loc",
  "range",
  "parent",
  "extra",
  "leadingComments",
  "trailingComments",
  "innerComments",
  "comments",
  "errors",
  "tokens",
  "original",
]);

export function isNode(value: unknown): value is Positioned {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { type?: unknown }).type === "string" &&
    typeof (value as { start?: unknown }).start === "number"
  );
}

function isNodeList(value: unknown): value is (Positioned | null)[] {
  return Array.isArray(value) && value.length > 0 && value.every((item) => item === null || isNode(item));
}

export function fieldsOf(node: ESTree.Node): Field[] {
  const fields: Field[] = [];
  for (const [key, value] of Object.entries(node)) {
    if (BOOKKEEPING_KEYS.has(key)) continue;
    if (isNode(value)) fields.push({ key, kind: "node", node: value });
    else if (isNodeList(value)) fields.push({ key, kind: "list", items: value });
    else fields.push({ key, kind: "value", value });
  }
  return fields;
}

export function childrenOf(node: ESTree.Node): ChildRef[] {
  const children: ChildRef[] = [];
  for (const field of fieldsOf(node)) {
    if (field.kind === "node") children.push({ key: field.key, node: field.node });
    if (field.kind === "list") {
      field.items.forEach((item, index) => {
        if (item) children.push({ key: field.key, index, node: item });
      });
    }
  }
  return children;
}

/** Colour category, shared with tokens so a number token and a number node look alike. */
export type NodeCategory = "identifier" | "number" | "string" | "regexp" | "keyword" | "operator" | "node";

export interface NodeLabel {
  type: string;
  detail?: string;
  category: NodeCategory;
}

/** The most telling bit of a node, for compact display in trees and diagrams. */
export function labelOf(node: ESTree.Node): NodeLabel {
  const { type } = node;
  switch (node.type) {
    case "Identifier":
      return { type, detail: node.name, category: "identifier" };
    case "PrivateIdentifier":
      return { type, detail: `#${node.name}`, category: "identifier" };
    case "Literal": {
      const raw = node.raw ?? String(node.value);
      if ("regex" in node && node.regex) return { type, detail: raw, category: "regexp" };
      if (typeof node.value === "number" || typeof node.value === "bigint") {
        return { type, detail: raw, category: "number" };
      }
      if (typeof node.value === "string") return { type, detail: raw, category: "string" };
      return { type, detail: raw, category: "keyword" };
    }
    case "TemplateElement":
      return { type, detail: JSON.stringify(node.value.cooked ?? node.value.raw), category: "string" };
    case "BinaryExpression":
    case "LogicalExpression":
    case "AssignmentExpression":
    case "UnaryExpression":
    case "UpdateExpression":
      return { type, detail: node.operator, category: "operator" };
    case "VariableDeclaration":
      return { type, detail: node.kind, category: "keyword" };
    case "MethodDefinition":
      return { type, detail: node.kind === "method" ? undefined : node.kind, category: "node" };
    case "ThisExpression":
      return { type, detail: "this", category: "keyword" };
    case "Super":
      return { type, detail: "super", category: "keyword" };
    default:
      return { type, category: "node" };
  }
}
