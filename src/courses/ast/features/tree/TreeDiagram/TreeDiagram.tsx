import { useMemo } from "react";
import * as stylex from "@stylexjs/stylex";
import { motion, useReducedMotion } from "motion/react";
import type { Positioned } from "@/courses/ast/engine/parsing/parse";
import { colors } from "@/design/tokens.stylex";
import { categoryColor } from "@/courses/ast/features/tree/category.styles";
import { layoutTree, type DiagramBox } from "./layout";
import { styles } from "./TreeDiagram.styles";

export interface TreeDiagramProps {
  root: Positioned;
  /** Short badges shown on nodes, e.g. evaluated values. */
  badges?: Map<Positioned, string>;
  highlighted?: Positioned | null;
  onHover?: (node: Positioned | null) => void;
  ariaLabel?: string;
  /** Drop the top rule, for diagrams that already sit in their own column. */
  bare?: boolean;
}

const MARGIN = 14;

function anchors(from: DiagramBox, to: DiagramBox) {
  return {
    x1: from.x + from.width / 2,
    y1: from.y + from.height,
    x2: to.x + to.width / 2,
    y2: to.y,
  };
}

export function TreeDiagram({
  root,
  badges,
  highlighted,
  onHover,
  ariaLabel = "Tree diagram",
  bare = false,
}: TreeDiagramProps) {
  const layout = useMemo(() => layoutTree(root), [root]);
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion ? { duration: 0 } : { type: "spring" as const, stiffness: 260, damping: 30 };

  return (
    <div {...stylex.props(styles.scroller, !bare && styles.ruled)}>
      <svg
        // With onHover the boxes can be focused, so it's a group of them rather than one picture.
        role={onHover ? "group" : "img"}
        aria-label={ariaLabel}
        width={layout.width + MARGIN * 2}
        height={layout.height + MARGIN * 2}
        viewBox={`${-MARGIN} ${-MARGIN} ${layout.width + MARGIN * 2} ${layout.height + MARGIN * 2}`}
        onMouseLeave={() => onHover?.(null)}
        onBlur={() => onHover?.(null)}
        {...stylex.props(styles.svg)}
      >
        {layout.edges.map((edge) => {
          const { x1, y1, x2, y2 } = anchors(edge.from, edge.to);
          // Put the field name halfway along the edge, nudged away from the line.
          const side = x2 < x1 - 1 ? -1 : x2 > x1 + 1 ? 1 : 0;
          return (
            <g key={`edge-${edge.id}`}>
              <motion.line
                initial={false}
                animate={{ x1, y1, x2, y2 }}
                transition={transition}
                stroke={colors.ruleStrong}
                strokeWidth={1}
              />
              <motion.text
                initial={false}
                animate={{ x: (x1 + x2) / 2 + side * 8, y: (y1 + y2) / 2 + 4 }}
                transition={transition}
                textAnchor={side < 0 ? "end" : side > 0 ? "start" : "middle"}
                {...stylex.props(styles.edgeLabel)}
              >
                {edge.label}
              </motion.text>
            </g>
          );
        })}

        {layout.boxes.map((box) => {
          const badge = badges?.get(box.node);
          const isHighlighted = box.node === highlighted;
          const badgeWidth = badge === undefined ? 0 : Math.max(24, badge.length * 8 + 12);
          return (
            <motion.g
              key={box.id}
              initial={reduceMotion ? false : { opacity: 0, x: box.x, y: box.y + 6 }}
              animate={{ opacity: 1, x: box.x, y: box.y }}
              transition={transition}
              onMouseEnter={() => onHover?.(box.node)}
              // Focus and tap do what hover does, for keyboards and touch screens.
              {...(onHover && {
                tabIndex: 0,
                "aria-label": [box.label.type, box.label.detail].filter(Boolean).join(" "),
                onFocus: () => onHover(box.node),
                onClick: () => onHover(box.node),
              })}
            >
              <rect
                width={box.width}
                height={box.height}
                fill={isHighlighted ? colors.focus : colors.surface}
                stroke={isHighlighted ? colors.accent : colors.ruleStrong}
                strokeWidth={isHighlighted ? 1.5 : 1}
              />
              <text
                x={box.width / 2}
                y={box.label.detail ? 18 : box.height / 2 + 4}
                textAnchor="middle"
                {...stylex.props(styles.type)}
              >
                {box.label.type}
              </text>
              {box.label.detail && (
                <text
                  x={box.width / 2}
                  y={37}
                  textAnchor="middle"
                  fill={categoryColor[box.label.category]}
                  {...stylex.props(styles.detail)}
                >
                  {box.label.detail}
                </text>
              )}
              {badge !== undefined && (
                <motion.g
                  key={badge}
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={transition}
                >
                  <rect x={box.width - badgeWidth / 2} y={-11} width={badgeWidth} height={20} fill={colors.accent} />
                  <text
                    x={box.width}
                    y={3}
                    textAnchor="middle"
                    fill={colors.surface}
                    {...stylex.props(styles.badge)}
                  >
                    {badge}
                  </text>
                </motion.g>
              )}
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
