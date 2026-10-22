import * as stylex from "@stylexjs/stylex";
import { colors, fontSizes, fonts, space } from "@/design/tokens.stylex";
import { breakpoints } from "@/design/layout.stylex";

export const styles = stylex.create({
  variables: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "baseline",
    gap: `${space.xs} ${space.lg}`,
  },
  variable: {
    display: "flex",
    alignItems: "baseline",
    gap: space.xs,
    fontFamily: fonts.code,
    fontSize: fontSizes.sm,
  },
  name: {
    color: colors.identifier,
  },
  input: {
    width: 64,
    padding: "1px 0",
    borderWidth: 0,
    borderBottomWidth: 1,
    borderStyle: "solid",
    borderColor: { default: colors.ruleStrong, ":focus": colors.accent },
    borderRadius: 0,
    outline: "none",
    backgroundColor: "transparent",
    color: colors.number,
    fontFamily: fonts.code,
    fontSize: fontSizes.sm,
  },
  problem: {
    margin: 0,
    color: colors.bad,
    fontFamily: fonts.code,
    fontSize: fontSizes.xs,
  },
  columns: {
    display: "grid",
    gridTemplateColumns: { default: "minmax(0, 3fr) minmax(0, 2fr)", [breakpoints.stackColumns]: "1fr" },
    gap: space.md,
  },
  column: {
    display: "flex",
    flexDirection: "column",
    gap: space.sm,
    minWidth: 0,
  },
  stepsColumn: {
    paddingLeft: { default: space.md, [breakpoints.stackColumns]: 0 },
    borderLeftWidth: { default: 1, [breakpoints.stackColumns]: 0 },
    borderLeftStyle: "solid",
    borderLeftColor: colors.rule,
  },
  steps: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    fontFamily: fonts.code,
    fontSize: fontSizes.sm,
  },
  step: {
    display: "grid",
    gridTemplateColumns: "2.5ch minmax(0, 1fr) auto",
    gap: space.sm,
    padding: `3px ${space.xs}`,
    borderLeftWidth: 2,
    borderLeftStyle: "solid",
    borderLeftColor: "transparent",
  },
  stepCurrent: {
    borderLeftColor: colors.accent,
    backgroundColor: colors.focus,
    color: colors.focusText,
  },
  stepPending: {
    color: colors.textMuted,
  },
  stepNumber: {
    color: colors.comment,
  },
  instruction: {
    whiteSpace: "pre",
  },
  result: {
    color: colors.number,
    textAlign: "right",
  },
  controls: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space.xs,
    paddingTop: space.sm,
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: colors.rule,
  },
  status: {
    marginLeft: "auto",
    fontFamily: fonts.code,
    fontSize: fontSizes.sm,
  },
});
