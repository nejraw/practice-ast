import * as stylex from "@stylexjs/stylex";
import { nodeAnimation, styles, tokenAnimation } from "./Loader.styles";

/**
 * A tiny parse of `load + ing`, on a loop. Nodes are built children first, so
 * the `+` comes last even though it's read before `ing`. Each token lights up
 * when its node is built.
 *
 * The animation is pure CSS (see Loader.styles.ts): on a prerendered page the
 * loader is on screen before any JavaScript has run, and it should already move.
 */
const NODES = [
  { id: "load", x: 38, y: 62, width: 46 },
  { id: "ing", x: 112, y: 62, width: 38 },
  { id: "+", x: 75, y: 16, width: 22, children: ["load", "ing"] },
] as const;

const TOKENS = ["load", "+", "ing"] as const;

const HEIGHT = 20;

/** An edge from the bottom of a parent to the top of a child. */
function edge(from: (typeof NODES)[number], to: (typeof NODES)[number]) {
  return { x1: from.x, y1: from.y + HEIGHT / 2, x2: to.x, y2: to.y - HEIGHT / 2 };
}

const NODE_BUILT_AS = { load: "first", ing: "second", "+": "third" } as const;

export function Loader({ label, small = false }: { label: string; small?: boolean }) {
  return (
    <div role="status" {...stylex.props(styles.loader)}>
      <div aria-hidden {...stylex.props(styles.tokens)}>
        {TOKENS.map((token) => (
          <span key={token} {...stylex.props(styles.token, tokenAnimation[NODE_BUILT_AS[token]])}>
            {token}
          </span>
        ))}
      </div>
      <svg aria-hidden viewBox="0 0 150 76" {...stylex.props(styles.tree, small && styles.treeSmall)}>
        {NODES.flatMap((node) =>
          "children" in node
            ? node.children.map((child) => (
                <line key={`${node.id}-${child}`} {...edge(node, NODES.find((n) => n.id === child)!)} {...stylex.props(styles.edge)} />
              ))
            : [],
        )}
        {NODES.map((node) => (
          <g key={node.id} {...stylex.props(styles.node, nodeAnimation[NODE_BUILT_AS[node.id]])}>
            <rect
              x={node.x - node.width / 2}
              y={node.y - HEIGHT / 2}
              width={node.width}
              height={HEIGHT}
              rx={HEIGHT / 2}
              {...stylex.props(styles.box, "children" in node && styles.operator)}
            />
            <text x={node.x} y={node.y} {...stylex.props(styles.label)}>
              {node.id}
            </text>
          </g>
        ))}
      </svg>
      <p {...stylex.props(styles.caption)}>// {label}</p>
    </div>
  );
}
