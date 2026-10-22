import * as stylex from "@stylexjs/stylex";
import { colors, fontSizes, fonts, space } from "@/design/tokens.stylex";
import { breakpoints } from "@/design/layout.stylex";

export const styles = stylex.create({
  registers: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "baseline",
    gap: `${space.xs} ${space.md}`,
    margin: 0,
    color: colors.textMuted,
    fontSize: fontSizes.sm,
  },
  register: {
    color: colors.identifier,
    fontFamily: fonts.code,
    fontWeight: 600,
  },
  columns: {
    display: "grid",
    gridTemplateColumns: { default: "minmax(0, 1.4fr) minmax(0, 1fr)", [breakpoints.stackColumns]: "1fr" },
    gap: space.md,
  },
  column: {
    display: "flex",
    flexDirection: "column",
    gap: space.sm,
    minWidth: 0,
  },
  codeColumn: {
    paddingLeft: { default: space.md, [breakpoints.stackColumns]: 0 },
    borderLeftWidth: { default: 1, [breakpoints.stackColumns]: 0 },
    borderLeftStyle: "solid",
    borderLeftColor: colors.rule,
  },
  lines: {
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  line: {
    display: "grid",
    gridTemplateColumns: "4.5ch minmax(0, 1fr) auto",
    columnGap: space.sm,
    padding: `5px ${space.xs}`,
    borderLeftWidth: 2,
    borderLeftStyle: "solid",
    borderLeftColor: "transparent",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: colors.rule,
    cursor: "default",
  },
  lineActive: {
    borderLeftColor: colors.accent,
    backgroundColor: colors.focus,
    color: colors.focusText,
  },
  lineTarget: {
    borderLeftColor: colors.good,
    backgroundColor: colors.goodSoft,
  },
  offset: {
    color: colors.comment,
    fontFamily: fonts.code,
    fontSize: fontSizes.xs,
    lineHeight: 1.9,
  },
  instruction: {
    fontFamily: fonts.code,
    fontSize: fontSizes.sm,
    fontWeight: 600,
  },
  bytes: {
    color: colors.textMuted,
    fontFamily: fonts.code,
    fontSize: fontSizes.xs,
    lineHeight: 1.9,
  },
  meaning: {
    gridColumn: "2 / -1",
    fontSize: fontSizes.sm,
    lineHeight: 1.4,
  },
  source: {
    margin: 0,
    textTransform: "none",
  },
});
