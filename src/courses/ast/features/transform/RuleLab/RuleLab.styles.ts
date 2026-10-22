import * as stylex from "@stylexjs/stylex";
import { colors, fontSizes, fonts, space } from "@/design/tokens.stylex";
import { breakpoints } from "@/design/layout.stylex";

export const styles = stylex.create({
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: space.xs,
  },
  columns: {
    display: "grid",
    gridTemplateColumns: { default: "minmax(0, 1.15fr) minmax(0, 1fr)", [breakpoints.stackColumns]: "1fr" },
    gap: space.md,
  },
  column: {
    display: "flex",
    flexDirection: "column",
    gap: space.sm,
    minWidth: 0,
  },
  results: {
    display: "flex",
    flexDirection: "column",
    gap: space.sm,
  },
  reports: {
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  report: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "baseline",
    gap: `0 ${space.sm}`,
    padding: `4px ${space.xs}`,
    borderLeftWidth: 2,
    borderLeftStyle: "solid",
    borderLeftColor: colors.bad,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: colors.rule,
    fontSize: fontSizes.sm,
    cursor: "default",
  },
  reportHovered: {
    borderLeftColor: colors.accent,
    backgroundColor: colors.focus,
    color: colors.focusText,
  },
  line: {
    minWidth: "7ch",
    color: colors.comment,
    fontFamily: fonts.code,
    fontSize: fontSizes.xs,
  },
  fixMark: {
    marginLeft: "auto",
    color: colors.good,
    fontFamily: fonts.code,
    fontSize: fontSizes.xs,
  },
  problem: {
    margin: 0,
    color: colors.bad,
    fontFamily: fonts.code,
    fontSize: fontSizes.xs,
  },
  hint: {
    margin: 0,
    textTransform: "none",
  },
});
