import { childrenOf, labelOf, type NodeLabel } from "@/courses/ast/engine/tree/children";
import type { Positioned } from "@/courses/ast/engine/parsing/parse";

export interface DiagramBox {
  /** Stable across re-parses (the field path from the root), so boxes can animate. */
  id: string;
  node: Positioned;
  label: NodeLabel;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DiagramEdge {
  id: string;
  from: DiagramBox;
  to: DiagramBox;
  label: string;
}

export interface DiagramLayout {
  boxes: DiagramBox[];
  edges: DiagramEdge[];
  width: number;
  height: number;
}

export const BOX_HEIGHT = 48;
const GAP_X = 14;
const LEVEL_HEIGHT = 92;
const TYPE_CHAR = 6.6;
const DETAIL_CHAR = 8.4;
const PADDING_X = 22;
const MIN_WIDTH = 64;

function boxWidth(label: NodeLabel) {
  const typeWidth = label.type.length * TYPE_CHAR;
  const detailWidth = (label.detail?.length ?? 0) * DETAIL_CHAR;
  return Math.max(MIN_WIDTH, Math.ceil(Math.max(typeWidth, detailWidth) + PADDING_X));
}

interface Measured {
  id: string;
  node: Positioned;
  label: NodeLabel;
  width: number;
  /** Width of the whole subtree, including gaps between children. */
  span: number;
  /** Width of just the children, side by side with gaps. */
  childrenSpan: number;
  children: { edgeLabel: string; child: Measured }[];
}

/**
 * A simple tidy-tree layout in two passes:
 * 1. bottom-up, measure how wide each subtree is;
 * 2. top-down, give each subtree its slot and centre the parent above its children.
 */
export function layoutTree(root: Positioned): DiagramLayout {
  const measure = (node: Positioned, id: string): Measured => {
    const label = labelOf(node);
    const children = childrenOf(node).map(({ key, index, node: child }) => {
      const edgeLabel = index === undefined ? key : `${key}[${index}]`;
      return { edgeLabel, child: measure(child, `${id}.${edgeLabel}`) };
    });
    const width = boxWidth(label);
    const childrenSpan =
      children.reduce((sum, { child }) => sum + child.span, 0) + GAP_X * Math.max(0, children.length - 1);
    return { id, node, label, width, span: Math.max(width, childrenSpan), childrenSpan, children };
  };

  const boxes: DiagramBox[] = [];
  const edges: DiagramEdge[] = [];
  let depthReached = 0;

  const place = (measured: Measured, left: number, depth: number): DiagramBox => {
    depthReached = Math.max(depthReached, depth);
    const box: DiagramBox = {
      id: measured.id,
      node: measured.node,
      label: measured.label,
      x: left + (measured.span - measured.width) / 2,
      y: depth * LEVEL_HEIGHT,
      width: measured.width,
      height: BOX_HEIGHT,
    };
    boxes.push(box);

    let cursor = left + (measured.span - measured.childrenSpan) / 2;
    for (const { edgeLabel, child } of measured.children) {
      const childBox = place(child, cursor, depth + 1);
      edges.push({ id: childBox.id, from: box, to: childBox, label: edgeLabel });
      cursor += child.span + GAP_X;
    }
    return box;
  };

  const measured = measure(root, "root");
  place(measured, 0, 0);
  return { boxes, edges, width: measured.span, height: depthReached * LEVEL_HEIGHT + BOX_HEIGHT };
}
