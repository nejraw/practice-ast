import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import * as stylex from "@stylexjs/stylex";
import { childrenOf, fieldsOf, labelOf } from "@/courses/ast/engine/tree/children";
import type { Positioned } from "@/courses/ast/engine/parsing/parse";
import { categoryText } from "@/courses/ast/features/tree/category.styles";
import { styles } from "./TreeView.styles";

type Row =
  | { kind: "node"; node: Positioned; id: string; field: string | null; depth: number; expandable: boolean }
  | { kind: "list"; field: string; count: number; depth: number }
  | { kind: "value"; field: string; value: unknown; depth: number };

/**
 * The tree is rendered as a flat list of visible rows. That keeps keyboard
 * navigation simple (next row, previous row) and avoids deep DOM nesting.
 *
 * Collapsed nodes are remembered by their path from the root (`body.0.expression`),
 * not by object: every edit re-parses into new objects, and what you folded away
 * should stay folded while you type.
 */

const childId = (parentId: string, key: string, index?: number) =>
  index === undefined ? `${parentId}.${key}` : `${parentId}.${key}.${index}`;

/** The ids of the nodes along a path from the root. */
function idsAlong(path: Positioned[]): string[] {
  const ids = path.length ? ["root"] : [];
  for (let i = 1; i < path.length; i++) {
    const child = childrenOf(path[i - 1]).find((c) => c.node === path[i]);
    if (!child) break;
    ids.push(childId(ids[i - 1], child.key, child.index));
  }
  return ids;
}

function visibleRows(root: Positioned, collapsed: Set<string>, showValues: boolean): Row[] {
  const rows: Row[] = [];
  const visit = (node: Positioned, id: string, field: string | null, depth: number) => {
    const fields = fieldsOf(node);
    const expandable = fields.some((f) => f.kind !== "value") || (showValues && fields.length > 0);
    rows.push({ kind: "node", node, id, field, depth, expandable });
    if (collapsed.has(id)) return;
    for (const f of fields) {
      if (f.kind === "node") visit(f.node, childId(id, f.key), f.key, depth + 1);
      else if (f.kind === "list") {
        rows.push({ kind: "list", field: f.key, count: f.items.length, depth: depth + 1 });
        f.items.forEach((item, index) => {
          if (item) visit(item, childId(id, f.key, index), `${index}`, depth + 2);
          else rows.push({ kind: "value", field: `${index}`, value: null, depth: depth + 2 });
        });
      } else if (showValues) rows.push({ kind: "value", field: f.key, value: f.value, depth: depth + 1 });
    }
  };
  visit(root, "root", null, 0);
  return rows;
}

function formatValue(value: unknown): string {
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "bigint") return `${value}n`;
  if (value instanceof RegExp) return value.toString();
  if (Array.isArray(value)) return "[]";
  if (typeof value === "object" && value !== null) return JSON.stringify(value);
  return String(value);
}

export interface TreeViewProps {
  root: Positioned;
  /** Path from the root to the selected node; ancestors are expanded automatically. */
  selectedPath?: Positioned[];
  hovered?: Positioned | null;
  onSelect?: (node: Positioned) => void;
  onHover?: (node: Positioned | null) => void;
  /** Show scalar fields such as `operator`, `name` and `kind` as their own rows. */
  showValues?: boolean;
  dimmed?: boolean;
}

export function TreeView({
  root,
  selectedPath = [],
  hovered,
  onSelect,
  onHover,
  showValues = true,
  dimmed = false,
}: TreeViewProps) {
  const [collapsed, setCollapsed] = useState(() => new Set<string>());
  const selected = selectedPath.at(-1) ?? null;
  const rowRefs = useRef(new Map<Positioned, HTMLDivElement>());

  // Make sure the selected node is visible, then scroll it into view.
  useEffect(() => {
    if (!selected) return;
    const ancestors = idsAlong(selectedPath).slice(0, -1);
    setCollapsed((current) => {
      if (!ancestors.some((id) => current.has(id))) return current;
      const next = new Set(current);
      for (const id of ancestors) next.delete(id);
      return next;
    });
    requestAnimationFrame(() => rowRefs.current.get(selected)?.scrollIntoView({ block: "nearest" }));
  }, [selected, selectedPath]);

  const rows = useMemo(() => visibleRows(root, collapsed, showValues), [root, collapsed, showValues]);
  const nodeRows = rows.filter((row) => row.kind === "node");

  const toggle = (id: string) =>
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const focusNode = (node: Positioned) => {
    onSelect?.(node);
    rowRefs.current.get(node)?.focus();
  };

  const onKeyDown = (event: KeyboardEvent, row: Extract<Row, { kind: "node" }>) => {
    const index = nodeRows.indexOf(row);
    const parent = selectedPath.at(-2);
    switch (event.key) {
      case "ArrowDown":
        if (nodeRows[index + 1]) focusNode(nodeRows[index + 1].node);
        break;
      case "ArrowUp":
        if (nodeRows[index - 1]) focusNode(nodeRows[index - 1].node);
        break;
      case "ArrowRight":
        if (collapsed.has(row.id)) toggle(row.id);
        else if (nodeRows[index + 1]?.depth > row.depth) focusNode(nodeRows[index + 1].node);
        break;
      case "ArrowLeft":
        if (row.expandable && !collapsed.has(row.id)) toggle(row.id);
        else if (parent) focusNode(parent);
        break;
      case "Enter":
      case " ":
        if (row.expandable) toggle(row.id);
        break;
      default:
        return;
    }
    event.preventDefault();
  };

  return (
    <div
      role="tree"
      aria-label="Abstract syntax tree"
      onMouseLeave={() => onHover?.(null)}
      {...stylex.props(styles.tree, dimmed && styles.dimmed)}
    >
      {rows.map((row, i) => {
        const indent = { paddingLeft: `calc(${row.depth} * 18px + 8px)` };
        if (row.kind !== "node") {
          return (
            <div key={`${row.kind}-${i}`} {...stylex.props(styles.row, styles.passive)} style={indent}>
              <span {...stylex.props(styles.toggleSpace)} />
              <span {...stylex.props(styles.field)}>{row.field}:</span>
              {row.kind === "list" ? (
                <span {...stylex.props(styles.muted)}>[{row.count}]</span>
              ) : (
                <span {...stylex.props(styles.value)}>{formatValue(row.value)}</span>
              )}
            </div>
          );
        }

        const label = labelOf(row.node);
        const isSelected = row.node === selected;
        const isOpen = !collapsed.has(row.id);
        return (
          <div
            key={row.id}
            ref={(el) => {
              if (el) rowRefs.current.set(row.node, el);
              else rowRefs.current.delete(row.node);
            }}
            role="treeitem"
            aria-level={row.depth + 1}
            aria-selected={isSelected}
            aria-expanded={row.expandable ? isOpen : undefined}
            tabIndex={isSelected || (!selected && i === 0) ? 0 : -1}
            onClick={() => onSelect?.(row.node)}
            onMouseEnter={() => onHover?.(row.node)}
            onKeyDown={(event) => onKeyDown(event, row)}
            {...stylex.props(
              styles.row,
              styles.nodeRow,
              row.node === hovered && styles.hovered,
              isSelected && styles.selected,
            )}
            style={indent}
          >
            {row.expandable ? (
              <button
                type="button"
                tabIndex={-1}
                aria-label={isOpen ? "Collapse" : "Expand"}
                onClick={(event) => {
                  event.stopPropagation();
                  toggle(row.id);
                }}
                {...stylex.props(styles.toggle)}
              >
                {isOpen ? "▾" : "▸"}
              </button>
            ) : (
              <span {...stylex.props(styles.toggleSpace)} />
            )}
            {row.field !== null && <span {...stylex.props(styles.field)}>{row.field}:</span>}
            <span {...stylex.props(styles.type)}>{label.type}</span>
            {label.detail !== undefined && (
              <span {...stylex.props(styles.detail, categoryText[label.category])}>{label.detail}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
