import * as stylex from "@stylexjs/stylex";
import { colors, fontSizes, fonts, space } from "@/design/tokens.stylex";

export const styles = stylex.create({
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: space.xs,
  },
  info: {
    margin: 0,
    padding: `${space.sm} ${space.md}`,
    borderLeftWidth: 2,
    borderLeftStyle: "solid",
    borderLeftColor: colors.accent,
    backgroundColor: colors.surfaceMuted,
    fontSize: fontSizes.md,
  },
  infoIdle: {
    borderLeftColor: colors.rule,
    color: colors.textMuted,
    fontStyle: "italic",
  },
  name: {
    color: colors.identifier,
    fontFamily: fonts.code,
    fontWeight: 600,
  },
  captured: {
    color: colors.accent,
  },
  scopes: {
    display: "flex",
    flexDirection: "column",
    gap: space.xs,
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  scope: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space.sm,
    paddingLeft: space.sm,
    borderLeftWidth: 1,
    borderLeftStyle: "solid",
    borderLeftColor: colors.ruleStrong,
  },
  scopeLabel: {
    minWidth: "14ch",
    textTransform: "none",
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
    gap: space.xs,
  },
  chip: {
    display: "inline-flex",
    alignItems: "baseline",
    gap: 6,
    padding: "2px 8px",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: { default: colors.ruleStrong, ":hover": colors.accent },
    borderRadius: 0,
    backgroundColor: colors.surface,
    color: colors.identifier,
    fontFamily: fonts.code,
    fontSize: fontSizes.sm,
    cursor: "pointer",
  },
  chipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.focus,
    color: colors.focusText,
  },
  kind: {
    color: colors.textMuted,
    fontSize: 10.5,
  },
  capturedMark: {
    color: colors.accent,
    fontWeight: 700,
  },
  globalChip: {
    borderStyle: "dashed",
    color: colors.textMuted,
    cursor: "default",
  },
  none: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    fontStyle: "italic",
  },
});
