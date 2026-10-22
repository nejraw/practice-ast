import * as stylex from "@stylexjs/stylex";
import { colors, fontSizes, fonts, space } from "@/design/tokens.stylex";

export const styles = stylex.create({
  panel: {
    paddingTop: space.sm,
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: colors.ruleStrong,
    fontSize: fontSizes.md,
    lineHeight: 1.55,
  },
  empty: {
    color: colors.textMuted,
    fontStyle: "italic",
  },
  breadcrumb: {
    display: "flex",
    flexWrap: "wrap",
    gap: space.xxs,
    margin: `0 0 ${space.sm}`,
    padding: 0,
    listStyle: "none",
    color: colors.textMuted,
    fontFamily: fonts.code,
    fontSize: fontSizes.xs,
  },
  crumb: {
    display: "flex",
    gap: space.xxs,
  },
  crumbButton: {
    padding: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    color: { default: colors.textMuted, ":hover": colors.accent },
    font: "inherit",
    cursor: "pointer",
  },
  type: {
    margin: `0 0 ${space.xs}`,
    fontFamily: fonts.code,
    fontSize: fontSizes.lg,
    fontWeight: 500,
  },
  summary: {
    margin: `0 0 ${space.sm}`,
  },
  fields: {
    display: "grid",
    gap: space.xs,
    margin: `0 0 ${space.sm}`,
  },
  fieldRow: {
    display: "grid",
    gridTemplateColumns: "minmax(90px, max-content) 1fr",
    gap: space.md,
  },
  fieldName: {
    color: colors.accent,
    fontFamily: fonts.code,
    fontSize: fontSizes.sm,
  },
  fieldDescription: {
    margin: 0,
    fontSize: fontSizes.sm,
  },
  label: {
    margin: `${space.md} 0 ${space.xs}`,
    color: colors.textMuted,
    fontFamily: fonts.code,
    fontSize: fontSizes.label,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
  snippet: {
    margin: 0,
    padding: `${space.sm} ${space.md}`,
    overflowX: "auto",
    borderLeftWidth: 2,
    borderLeftStyle: "solid",
    borderLeftColor: colors.ruleStrong,
    backgroundColor: colors.surfaceMuted,
    fontFamily: fonts.code,
    fontSize: fontSizes.sm,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
});
