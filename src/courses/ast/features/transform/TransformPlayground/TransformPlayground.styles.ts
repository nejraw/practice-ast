import * as stylex from "@stylexjs/stylex";
import { colors, fontSizes, fonts, space } from "@/design/tokens.stylex";
import { breakpoints } from "@/design/layout.stylex";

export const styles = stylex.create({
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: space.xs,
  },
  changes: {
    display: "flex",
    flexDirection: "column",
    gap: space.xs,
    padding: `${space.sm} ${space.md}`,
    borderLeftWidth: 2,
    borderLeftStyle: "solid",
    borderLeftColor: colors.accent,
    backgroundColor: colors.surfaceMuted,
  },
  list: {
    margin: 0,
    paddingLeft: space.md,
    fontSize: fontSizes.sm,
  },
  none: {
    margin: 0,
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontStyle: "italic",
  },
  columns: {
    display: "grid",
    gridTemplateColumns: { default: "minmax(0, 1fr) minmax(0, 1fr)", [breakpoints.stackColumns]: "1fr" },
    gap: space.md,
  },
  column: {
    display: "flex",
    flexDirection: "column",
    gap: space.sm,
    minWidth: 0,
  },
  printer: {
    color: colors.accent,
    fontFamily: fonts.code,
    fontWeight: 600,
  },
  stats: {
    margin: 0,
    color: colors.textMuted,
    fontSize: fontSizes.sm,
  },
  lost: {
    color: colors.bad,
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
