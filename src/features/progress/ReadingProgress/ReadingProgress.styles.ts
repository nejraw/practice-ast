import * as stylex from "@stylexjs/stylex";
import { breakpoints } from "@/design/layout.stylex";
import { colors, fontSizes, fonts, space } from "@/design/tokens.stylex";

export const styles = stylex.create({
  bar: {
    position: "sticky",
    top: { default: 0, [breakpoints.narrow]: 45 },
    zIndex: 5,
    display: "flex",
    alignItems: "center",
    gap: space.md,
    margin: `0 0 ${space.lg}`,
    padding: `${space.xs} 0`,
    backgroundColor: colors.bg,
  },
  tracks: {
    display: "flex",
    flexGrow: 1,
    gap: 4,
  },
  track: {
    flexBasis: 0,
    height: 3,
    backgroundColor: colors.rule,
    overflow: "hidden",
  },
  // Optional material: the same bar, in a quieter colour.
  deeperFill: {
    backgroundColor: colors.comment,
  },
  fill: {
    height: "100%",
    backgroundColor: colors.accent,
    transformOrigin: "left",
    transition: { default: "transform 120ms linear", "@media (prefers-reduced-motion: reduce)": "none" },
  },
  label: {
    flexShrink: 0,
    color: colors.textMuted,
    fontFamily: fonts.code,
    fontSize: fontSizes.xs,
    fontVariantNumeric: "tabular-nums",
  },
  finished: {
    color: colors.good,
  },
});
