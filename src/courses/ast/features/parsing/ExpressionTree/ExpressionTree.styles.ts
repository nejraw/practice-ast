import * as stylex from "@stylexjs/stylex";
import { colors, fontSizes, fonts } from "@/design/tokens.stylex";

export const styles = stylex.create({
  error: {
    margin: 0,
    color: colors.bad,
    fontFamily: fonts.code,
    fontSize: fontSizes.xs,
  },
  stale: {
    opacity: 0.4,
  },
});
