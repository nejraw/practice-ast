import * as stylex from "@stylexjs/stylex";
import { colors, fontSizes, fonts } from "@/design/tokens.stylex";

export const styles = stylex.create({
  link: {
    color: { default: colors.barText, ":hover": colors.accent },
    fontFamily: fonts.code,
    fontSize: fontSizes.xs,
    textDecoration: "none",
    whiteSpace: "nowrap",
  },
});
