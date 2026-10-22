import * as stylex from "@stylexjs/stylex";
import { colors, fonts } from "@/design/tokens.stylex";

export const styles = stylex.create({
  cite: {
    marginLeft: "0.15em",
    fontFamily: fonts.code,
    fontSize: "0.62em",
    fontStyle: "normal",
    lineHeight: 0,
  },
  link: {
    color: { default: colors.accent, ":hover": colors.text },
    textDecoration: "none",
  },
});
