import * as stylex from "@stylexjs/stylex";
import { colors, fontSizes, fonts, space } from "@/design/tokens.stylex";
import { breakpoints } from "@/design/layout.stylex";

export const styles = stylex.create({
  controls: {
    display: "flex",
    flexWrap: "wrap",
    gap: space.lg,
  },
  field: {
    display: "flex",
    alignItems: "baseline",
    gap: space.sm,
  },
  input: {
    width: 120,
    padding: "2px 0",
    borderWidth: 0,
    borderBottomWidth: 1,
    borderStyle: "solid",
    borderColor: { default: colors.ruleStrong, ":focus": colors.accent },
    borderRadius: 0,
    outline: "none",
    backgroundColor: "transparent",
    color: colors.identifier,
    fontFamily: fonts.code,
    fontSize: fontSizes.sm,
  },
  columns: {
    display: "grid",
    gridTemplateColumns: { default: "1fr 1fr", [breakpoints.stackColumns]: "1fr" },
    gap: space.md,
  },
  column: {
    display: "flex",
    flexDirection: "column",
    gap: space.xs,
    minWidth: 0,
  },
  heading: {
    margin: 0,
    fontSize: fontSizes.md,
    fontWeight: 600,
  },
  summary: {
    margin: 0,
    fontSize: fontSizes.sm,
    fontStyle: "italic",
  },
  summaryBad: {
    color: colors.bad,
  },
  summaryGood: {
    color: colors.good,
  },
  note: {
    margin: 0,
    color: colors.textMuted,
    fontSize: fontSizes.sm,
  },
});
