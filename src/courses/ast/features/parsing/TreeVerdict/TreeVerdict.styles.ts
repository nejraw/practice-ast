import * as stylex from "@stylexjs/stylex";
import { colors, fontSizes, space } from "@/design/tokens.stylex";

export const styles = stylex.create({
  verdict: {
    margin: 0,
    paddingTop: space.sm,
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: colors.rule,
    fontSize: fontSizes.lg,
    fontStyle: "italic",
    fontWeight: 600,
    textAlign: "center",
  },
  same: {
    color: colors.good,
  },
  different: {
    color: colors.accent,
  },
});
