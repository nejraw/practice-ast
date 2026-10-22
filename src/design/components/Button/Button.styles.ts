import * as stylex from "@stylexjs/stylex";
import { colors, fontSizes, fonts } from "@/design/tokens.stylex";

export const styles = stylex.create({
  button: {
    padding: "3px 10px",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: { default: colors.rule, ":hover": colors.ruleStrong },
    borderRadius: 0,
    backgroundColor: "transparent",
    color: colors.text,
    fontFamily: fonts.code,
    fontSize: fontSizes.xs,
    cursor: { default: "pointer", ":disabled": "not-allowed" },
    opacity: { default: 1, ":disabled": 0.4 },
  },
  active: {
    borderColor: { default: colors.ruleStrong, ":hover": colors.ruleStrong },
    backgroundColor: colors.barBg,
    color: colors.barText,
  },
  primary: {
    borderColor: { default: colors.accent, ":hover": colors.accent },
    backgroundColor: colors.accent,
    color: colors.surface,
    fontWeight: 600,
  },
});
