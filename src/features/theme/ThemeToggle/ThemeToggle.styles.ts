import * as stylex from "@stylexjs/stylex";
import { colors, fontSizes, fonts, space } from "@/design/tokens.stylex";

export const styles = stylex.create({
  group: {
    display: "flex",
  },
  option: {
    flexGrow: 1,
    padding: `${space.xs} ${space.sm}`,
    marginLeft: { default: -1, ":first-child": 0 },
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.ruleStrong,
    borderRadius: 0,
    backgroundColor: "transparent",
    color: { default: colors.text, ":hover": colors.accent },
    fontFamily: fonts.code,
    fontSize: fontSizes.label,
    cursor: "pointer",
  },
  // Ink on paper, inverted: the chosen option reads as filled in.
  active: {
    backgroundColor: colors.ruleStrong,
    color: { default: colors.bg, ":hover": colors.bg },
  },
});
