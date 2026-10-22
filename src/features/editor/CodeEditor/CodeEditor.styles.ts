import * as stylex from "@stylexjs/stylex";
import { colors, fontSizes, fonts, space } from "@/design/tokens.stylex";

export const styles = stylex.create({
  wrap: {
    minWidth: 0,
  },
  host: {
    overflow: "hidden",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: { default: colors.rule, ":focus-within": colors.ruleStrong },
    backgroundColor: colors.bg,
  },
  readOnly: {
    backgroundColor: colors.surfaceMuted,
  },
  // Below the editor while it has focus. Hidden, it still serves as the editor's
  // description: aria-describedby reads hidden text too.
  hint: {
    display: "none",
    margin: 0,
    paddingTop: space.xxs,
    color: colors.textMuted,
    fontFamily: fonts.code,
    fontSize: fontSizes.xs,
    textAlign: "right",
  },
  hintShown: {
    display: "block",
  },
});
