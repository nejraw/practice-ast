import * as stylex from "@stylexjs/stylex";
import { colors, fontSizes, fonts, space } from "@/design/tokens.stylex";

export const styles = stylex.create({
  tree: {
    padding: `${space.sm} 0`,
    fontFamily: fonts.code,
    fontSize: fontSizes.sm,
    lineHeight: 1.5,
    transition: "opacity 150ms",
  },
  dimmed: {
    opacity: 0.45,
  },
  row: {
    display: "flex",
    alignItems: "baseline",
    gap: 6,
    minWidth: "max-content",
    paddingRight: space.md,
    paddingBlock: 1,
    whiteSpace: "nowrap",
  },
  nodeRow: {
    cursor: "pointer",
    outline: { default: null, ":focus-visible": `2px solid ${colors.accent}` },
    outlineOffset: -2,
  },
  passive: {
    color: colors.textMuted,
  },
  hovered: {
    backgroundColor: colors.surfaceMuted,
  },
  selected: {
    backgroundColor: colors.focus,
    color: colors.focusText,
  },
  toggle: {
    width: 14,
    padding: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    color: colors.textMuted,
    font: "inherit",
    cursor: "pointer",
  },
  toggleSpace: {
    display: "inline-block",
    width: 14,
    flexShrink: 0,
  },
  field: {
    color: colors.textMuted,
  },
  type: {
    fontWeight: 600,
  },
  detail: {
    fontWeight: 500,
  },
  muted: {
    color: colors.textMuted,
  },
  value: {
    color: colors.text,
  },
});
