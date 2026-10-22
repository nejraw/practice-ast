import { childrenOf } from "./children";
import type { Positioned } from "@/courses/ast/engine/parsing/parse";

/**
 * The path from `root` down to the deepest node that contains `offset`.
 * An offset right after a node (where the cursor sits after typing it) counts
 * as inside, so a cursor at the end of `foo` still finds the identifier.
 */
export function pathAt(root: Positioned, offset: number): Positioned[] {
  const path: Positioned[] = [];
  let current: Positioned | undefined = root;
  while (current) {
    path.push(current);
    current = childrenOf(current).find(
      ({ node }) => node.start <= offset && offset <= node.end && node.end > node.start,
    )?.node;
  }
  return path;
}

/** The path from `root` to `target`, or an empty array if it is not in the tree. */
export function pathTo(root: Positioned, target: Positioned): Positioned[] {
  if (root === target) return [root];
  for (const { node } of childrenOf(root)) {
    const rest = pathTo(node, target);
    if (rest.length) return [root, ...rest];
  }
  return [];
}
