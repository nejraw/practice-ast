import * as stylex from "@stylexjs/stylex";
import { colors, fontSizes, fonts, space } from "@/design/tokens.stylex";

export const text = stylex.create({
  expression: { color: colors.keyword },
  term: { color: colors.identifier },
  factor: { color: colors.number },
});

export const border = stylex.create({
  expression: { borderColor: colors.keyword },
  term: { borderColor: colors.identifier },
  factor: { borderColor: colors.number },
});

export const swatch = stylex.create({
  expression: { backgroundColor: colors.keyword },
  term: { backgroundColor: colors.identifier },
  factor: { backgroundColor: colors.number },
});

export const styles = stylex.create({
  presets: {
    display: "flex",
    flexWrap: "wrap",
    gap: space.xs,
  },
  rules: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  rule: {
    display: "grid",
    gridTemplateColumns: "10px 11ch minmax(0, 1fr)",
    alignItems: "baseline",
    gap: space.sm,
    padding: `2px ${space.xs}`,
    fontSize: fontSizes.md,
  },
  ruleHovered: {
    backgroundColor: colors.focus,
    color: colors.focusText,
  },
  swatch: {
    width: 10,
    height: 10,
  },
  ruleName: {
    fontFamily: fonts.code,
    fontSize: fontSizes.sm,
    fontWeight: 600,
  },
  ruleMeaning: {
    fontStyle: "italic",
  },
  canvas: {
    display: "flex",
    justifyContent: "center",
    padding: `${space.md} 0`,
    overflowX: "auto",
  },
  box: {
    position: "relative",
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 2,
    padding: "3px 6px 6px",
    borderWidth: 1.5,
    borderStyle: "solid",
    backgroundColor: colors.surface,
    cursor: "default",
  },
  boxHovered: {
    backgroundColor: colors.focus,
  },
  boxLabel: {
    fontFamily: fonts.code,
    fontSize: 10,
    fontWeight: 600,
    lineHeight: 1.2,
    whiteSpace: "nowrap",
  },
  labelJoin: {
    color: colors.textMuted,
    fontWeight: 400,
  },
  boxBody: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  token: {
    padding: "0 2px",
    color: colors.text,
    fontFamily: fonts.code,
    fontSize: fontSizes.md,
    fontWeight: 500,
  },
  problem: {
    margin: 0,
    color: colors.bad,
    fontFamily: fonts.code,
    fontSize: fontSizes.xs,
  },
  hint: {
    margin: 0,
    textAlign: "center",
    textTransform: "none",
  },
});
