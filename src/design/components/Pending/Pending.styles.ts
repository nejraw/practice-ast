import * as stylex from "@stylexjs/stylex";
import { colors, fontSizes, fonts } from "@/design/tokens.stylex";

export const styles = stylex.create({
  // Most figures are at least this tall, so the page barely moves when one appears.
  pending: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 220,
  },
  note: {
    margin: 0,
    color: colors.comment,
    fontFamily: fonts.code,
    fontSize: fontSizes.xs,
  },
});
