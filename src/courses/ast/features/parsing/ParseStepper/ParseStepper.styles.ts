import * as stylex from "@stylexjs/stylex";
import { colors, fontSizes, fonts, space } from "@/design/tokens.stylex";
import { breakpoints } from "@/design/layout.stylex";

export const styles = stylex.create({
  row: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space.xs,
  },
  token: {
    padding: "1px 7px",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.rule,
    color: colors.textMuted,
    fontFamily: fonts.code,
    fontSize: fontSizes.sm,
  },
  tokenRead: {
    borderColor: colors.ruleStrong,
    backgroundColor: colors.surfaceMuted,
    color: colors.text,
  },
  tokenNext: {
    borderColor: colors.accent,
    borderStyle: "dashed",
    color: colors.text,
  },
  tokenJustRead: {
    borderColor: colors.accent,
    borderStyle: "solid",
    backgroundColor: colors.focus,
    color: colors.focusText,
  },
  tokenLegend: {
    marginLeft: space.sm,
    textTransform: "none",
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
  treeColumn: {
    paddingLeft: { default: space.md, [breakpoints.stackColumns]: 0 },
    borderLeftWidth: { default: 1, [breakpoints.stackColumns]: 0 },
    borderLeftStyle: "solid",
    borderLeftColor: colors.rule,
  },
  grammar: {
    margin: `0 0 ${space.sm}`,
    padding: 0,
    listStyle: "none",
    fontFamily: fonts.code,
    fontSize: fontSizes.xs,
  },
  grammarLine: {
    padding: `2px ${space.xs}`,
    borderLeftWidth: 2,
    borderLeftStyle: "solid",
    borderLeftColor: "transparent",
    color: colors.textMuted,
    whiteSpace: "pre",
    overflowX: "auto",
  },
  grammarActive: {
    borderLeftColor: colors.accent,
    backgroundColor: colors.focus,
    color: colors.focusText,
  },
  stack: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    fontFamily: fonts.code,
    fontSize: fontSizes.sm,
  },
  frame: {
    display: "flex",
    flexWrap: "wrap",
    gap: `0 ${space.sm}`,
    paddingBlock: 2,
    color: colors.textMuted,
  },
  frameTop: {
    color: colors.accent,
    fontWeight: 600,
  },
  holds: {
    color: colors.textMuted,
    fontWeight: 400,
    fontStyle: "italic",
  },
  empty: {
    margin: 0,
    color: colors.textMuted,
    fontFamily: fonts.code,
    fontSize: fontSizes.xs,
    fontStyle: "italic",
  },
  pieces: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-start",
    gap: space.sm,
    minHeight: 64,
  },
  message: {
    margin: 0,
    padding: `${space.sm} ${space.md}`,
    borderLeftWidth: 2,
    borderLeftStyle: "solid",
    borderLeftColor: colors.accent,
    backgroundColor: colors.surfaceMuted,
    fontSize: fontSizes.md,
  },
  messageError: {
    borderLeftColor: colors.bad,
    backgroundColor: colors.badSoft,
    color: colors.bad,
  },
  controls: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space.xs,
  },
  status: {
    marginLeft: "auto",
    fontFamily: fonts.code,
    fontSize: fontSizes.sm,
  },
});
