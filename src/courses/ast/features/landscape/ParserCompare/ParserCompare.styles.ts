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
    gridTemplateColumns: { default: "repeat(3, minmax(0, 1fr))", [breakpoints.stackColumns]: "1fr" },
    gap: space.md,
  },
  column: {
    display: "flex",
    flexDirection: "column",
    gap: space.xs,
    minWidth: 0,
  },
  name: {
    color: colors.accent,
    fontFamily: fonts.code,
    textTransform: "none",
  },
  outline: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    fontFamily: fonts.code,
    fontSize: fontSizes.xs,
    lineHeight: 1.7,
  },
  node: {
    overflow: "hidden",
    borderLeftWidth: 2,
    borderLeftStyle: "solid",
    borderLeftColor: "transparent",
    color: colors.text,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    cursor: "default",
  },
  nodeHovered: {
    borderLeftColor: colors.accent,
    backgroundColor: colors.focus,
    color: colors.focusText,
  },
  detail: {
    color: colors.identifier,
  },
  error: {
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
