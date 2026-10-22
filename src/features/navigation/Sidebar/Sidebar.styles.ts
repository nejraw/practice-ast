import * as stylex from "@stylexjs/stylex";
import { colors, fontSizes, fonts, space } from "@/design/tokens.stylex";

export const styles = stylex.create({
  nav: {
    display: "flex",
    flexDirection: "column",
    padding: `${space.xl} ${space.lg}`,
  },
  brand: {
    display: "flex",
    flexDirection: "column",
    gap: space.xs,
    paddingBottom: space.lg,
    marginBottom: space.md,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: colors.ruleStrong,
    color: colors.text,
    textDecoration: "none",
  },
  brandSubtitle: {
    color: colors.comment,
    fontFamily: fonts.code,
    fontSize: fontSizes.xs,
  },
  heading: {
    margin: `${space.md} 0 ${space.xs}`,
    textTransform: "none",
    letterSpacing: "0.02em",
  },
  list: {
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  linkReset: {
    display: "block",
    color: "inherit",
    textDecoration: "none",
    outlineOffset: 2,
  },
  entry: {
    display: "flex",
    alignItems: "baseline",
    gap: space.sm,
    paddingBlock: 4,
    color: { default: colors.text, ":hover": colors.accent },
    fontSize: fontSizes.md,
    lineHeight: 1.35,
  },
  active: {
    color: { default: colors.text, ":hover": colors.text },
    fontWeight: 600,
  },
  number: {
    flexShrink: 0,
    color: colors.textMuted,
    fontFamily: fonts.code,
    fontSize: fontSizes.xs,
    fontWeight: 400,
    whiteSpace: "pre",
  },
  activeNumber: {
    color: colors.accent,
  },
  title: {
    flexGrow: 1,
    minWidth: 0,
  },
  finishedNumber: {
    color: colors.good,
  },
  minutes: {
    flexShrink: 0,
    color: colors.textMuted,
    fontFamily: fonts.code,
    fontSize: fontSizes.xs,
    fontWeight: 400,
    fontVariantNumeric: "tabular-nums",
  },
  progress: {
    display: "flex",
    flexDirection: "column",
    gap: space.xs,
    marginBottom: space.sm,
  },
  track: {
    height: 3,
    backgroundColor: colors.rule,
  },
  fill: {
    height: "100%",
    backgroundColor: colors.good,
    transition: { default: "width 300ms ease", "@media (prefers-reduced-motion: reduce)": "none" },
  },
  progressText: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "baseline",
    gap: `0 ${space.sm}`,
    margin: 0,
    color: colors.textMuted,
    fontFamily: fonts.code,
    fontSize: fontSizes.xs,
  },
  reset: {
    marginLeft: "auto",
    padding: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    color: { default: colors.textMuted, ":hover": colors.accent },
    fontFamily: fonts.code,
    fontSize: fontSizes.xs,
    textDecoration: "underline",
    cursor: "pointer",
  },
});
