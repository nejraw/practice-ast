import * as stylex from "@stylexjs/stylex";
import { colors } from "@/design/tokens.stylex";

export const styles = stylex.create({
  link: {
    color: "inherit",
    textDecorationColor: colors.accent,
    textDecorationThickness: { default: 1, ":hover": 2 },
    textUnderlineOffset: 3,
  },
});
