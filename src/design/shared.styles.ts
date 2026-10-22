import * as stylex from "@stylexjs/stylex";
import { colors, fontSizes, fonts } from "./tokens.stylex";

export const shared = stylex.create({
  /** Small uppercase monospace labels: the "caption" voice of the book. */
  caption: {
    color: colors.textMuted,
    fontFamily: fonts.code,
    fontSize: fontSizes.label,
    fontWeight: 500,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
});
