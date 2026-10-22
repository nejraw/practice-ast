import * as stylex from "@stylexjs/stylex";
import { colors, fontSizes, fonts, space } from "@/design/tokens.stylex";

export const styles = stylex.create({
  pre: {
    margin: `${space.lg} 0`,
    padding: `${space.md} ${space.lg}`,
    overflowX: "auto",
    borderLeftWidth: 2,
    borderLeftStyle: "solid",
    borderLeftColor: colors.ruleStrong,
    backgroundColor: colors.surfaceMuted,
    fontFamily: fonts.code,
    fontSize: fontSizes.sm,
    lineHeight: 1.6,
  },
  blockCode: {
    fontFamily: "inherit",
  },
  inlineCode: {
    padding: "1px 4px",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.rule,
    backgroundColor: colors.surfaceMuted,
    fontFamily: fonts.code,
    fontSize: "0.82em",
    letterSpacing: "-0.01em",
    whiteSpace: "nowrap",
  },
});
