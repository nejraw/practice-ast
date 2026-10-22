import * as stylex from "@stylexjs/stylex";
import { colors, fontSizes, fonts, space } from "@/design/tokens.stylex";

export const styles = stylex.create({
  check: {
    clear: "both",
    margin: `${space.xl} 0`,
    padding: `${space.md} ${space.lg}`,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.ruleStrong,
  },
  label: {
    display: "block",
    marginBottom: space.xs,
    color: colors.comment,
    fontFamily: fonts.code,
    fontSize: fontSizes.xs,
  },
  question: {
    margin: `0 0 ${space.sm}`,
    fontWeight: 600,
  },
  answer: {
    paddingTop: space.sm,
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: colors.rule,
  },
  button: {
    padding: "3px 10px",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: { default: colors.rule, ":hover": colors.accent },
    borderRadius: 0,
    backgroundColor: "transparent",
    color: colors.text,
    fontFamily: fonts.code,
    fontSize: fontSizes.xs,
    cursor: "pointer",
  },
  waiting: {
    cursor: "wait",
    opacity: 0.5,
  },
});
