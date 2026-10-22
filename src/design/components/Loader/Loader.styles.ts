import * as stylex from "@stylexjs/stylex";
import { colors, fontSizes, fonts, space } from "@/design/tokens.stylex";

/**
 * One loop is eight steps of 320ms: build the three nodes one per step, hold the
 * finished tree for four, then clear it. Each keyframe set below shows a part
 * from the step its node is built until the clear (12.5% per step).
 */
const LOOP = "2560ms";

// Nodes fade and grow in when built: first `load`, then `ing`, then `+`.
const nodeFirst = stylex.keyframes({
  "0%, 12.5%": { opacity: 0, transform: "scale(0.6)" },
  "20%, 87.5%": { opacity: 1, transform: "scale(1)" },
  "95%, 100%": { opacity: 0, transform: "scale(0.6)" },
});

const nodeSecond = stylex.keyframes({
  "0%, 25%": { opacity: 0, transform: "scale(0.6)" },
  "32.5%, 87.5%": { opacity: 1, transform: "scale(1)" },
  "95%, 100%": { opacity: 0, transform: "scale(0.6)" },
});

const nodeThird = stylex.keyframes({
  "0%, 37.5%": { opacity: 0, transform: "scale(0.6)" },
  "45%, 87.5%": { opacity: 1, transform: "scale(1)" },
  "95%, 100%": { opacity: 0, transform: "scale(0.6)" },
});

// The edges belong to `+`, the third node.
const edgeIn = stylex.keyframes({
  "0%, 37.5%": { opacity: 0 },
  "45%, 87.5%": { opacity: 1 },
  "95%, 100%": { opacity: 0 },
});

// Tokens light up with their node.
const tokenOff = { borderColor: colors.rule, backgroundColor: "transparent", color: colors.textMuted };

const tokenOn = { borderColor: colors.accent, backgroundColor: colors.focus, color: colors.focusText };

const tokenFirst = stylex.keyframes({ "0%, 12.5%": tokenOff, "20%, 87.5%": tokenOn, "95%, 100%": tokenOff });

const tokenSecond = stylex.keyframes({ "0%, 25%": tokenOff, "32.5%, 87.5%": tokenOn, "95%, 100%": tokenOff });

const tokenThird = stylex.keyframes({ "0%, 37.5%": tokenOff, "45%, 87.5%": tokenOn, "95%, 100%": tokenOff });

// Fast loads shouldn't flash: the loader only appears after a moment.
const appear = stylex.keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

/** With reduced motion, the finished tree just stays up. */
const REDUCED = "@media (prefers-reduced-motion: reduce)";

export const nodeAnimation = stylex.create({
  first: { animationName: { default: nodeFirst, [REDUCED]: "none" } },
  second: { animationName: { default: nodeSecond, [REDUCED]: "none" } },
  third: { animationName: { default: nodeThird, [REDUCED]: "none" } },
});

export const tokenAnimation = stylex.create({
  first: { animationName: { default: tokenFirst, [REDUCED]: "none" } },
  second: { animationName: { default: tokenSecond, [REDUCED]: "none" } },
  third: { animationName: { default: tokenThird, [REDUCED]: "none" } },
});

export const styles = stylex.create({
  loader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: space.sm,
    padding: `${space.xl} 0`,
    animationName: appear,
    animationDuration: "200ms",
    animationDelay: "150ms",
    animationFillMode: "both",
  },
  tokens: {
    display: "flex",
    gap: 4,
  },
  // Without motion, every token stays lit, like the finished tree.
  token: {
    minWidth: 22,
    padding: "1px 6px",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: { default: colors.rule, [REDUCED]: colors.accent },
    backgroundColor: { default: "transparent", [REDUCED]: colors.focus },
    color: { default: colors.textMuted, [REDUCED]: colors.focusText },
    fontFamily: fonts.code,
    fontSize: fontSizes.sm,
    textAlign: "center",
    animationDuration: LOOP,
    animationIterationCount: "infinite",
    animationTimingFunction: "ease-out",
  },

  tree: {
    width: 150,
    height: 76,
    overflow: "visible",
  },
  treeSmall: {
    width: 110,
    height: 56,
  },
  edge: {
    stroke: colors.ruleStrong,
    strokeWidth: 1.5,
    animationName: { default: edgeIn, [REDUCED]: "none" },
    animationDuration: LOOP,
    animationIterationCount: "infinite",
    animationTimingFunction: "ease-out",
  },
  node: {
    transformBox: "fill-box",
    transformOrigin: "center",
    animationDuration: LOOP,
    animationIterationCount: "infinite",
    animationTimingFunction: "ease-out",
  },

  box: {
    fill: colors.surface,
    stroke: colors.ruleStrong,
    strokeWidth: 1.5,
  },
  operator: {
    stroke: colors.accent,
  },
  label: {
    fill: colors.text,
    fontFamily: fonts.code,
    fontSize: 11,
    fontWeight: 600,
    textAnchor: "middle",
    dominantBaseline: "central",
  },
  caption: {
    margin: 0,
    color: colors.comment,
    fontFamily: fonts.code,
    fontSize: fontSizes.xs,
  },
});
