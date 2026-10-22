import type * as ESTree from "estree";
import { childrenOf } from "./children";
import type { Positioned } from "@/courses/ast/engine/parsing/parse";

export interface WalkContext {
  parent: Positioned | null;
  /** The field of the parent this node lives in, e.g. "left" or "body". */
  key: string | null;
}

/** Visits every node depth-first, parents before children. */
export function walk(
  root: Positioned,
  enter: (node: Positioned, context: WalkContext) => void,
): void {
  const visit = (node: Positioned, context: WalkContext) => {
    enter(node, context);
    for (const child of childrenOf(node)) {
      visit(child.node, { parent: node, key: child.key });
    }
  };
  visit(root, { parent: null, key: null });
}

/** Structural equality, ignoring positions and the original spelling of literals. */
export function sameTree(a: ESTree.Node, b: ESTree.Node): boolean {
  return JSON.stringify(a, structuralKeys) === JSON.stringify(b, structuralKeys);
}

function structuralKeys(key: string, value: unknown) {
  if (key === "start" || key === "end" || key === "loc" || key === "range" || key === "raw") return undefined;
  if (typeof value === "bigint") return `${value}n`;
  if (value instanceof RegExp) return value.toString();
  return value;
}
