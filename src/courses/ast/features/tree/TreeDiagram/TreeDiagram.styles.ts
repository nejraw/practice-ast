import * as stylex from "@stylexjs/stylex";
import { colors, fonts } from "@/design/tokens.stylex";

export const styles = stylex.create({
  scroller: {
    overflowX: "auto",
    textAlign: "center",
  },
  ruled: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: colors.rule,
  },
  svg: {
    display: "inline-block",
    maxWidth: "none",
    overflow: "visible",
  },
  type: {
    fill: colors.textMuted,
    fontFamily: fonts.code,
    fontSize: 10.5,
    letterSpacing: "0.02em",
  },
  detail: {
    fontFamily: fonts.code,
    fontSize: 15,
    fontWeight: 500,
  },
  edgeLabel: {
    fill: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 13,
    fontStyle: "italic",
  },
  badge: {
    fontFamily: fonts.code,
    fontSize: 12,
    fontWeight: 600,
  },
});
