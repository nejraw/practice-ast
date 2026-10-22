import * as stylex from "@stylexjs/stylex";
import { breakpoints } from "@/design/layout.stylex";
import { colors, fontSizes, space } from "@/design/tokens.stylex";

export const styles = stylex.create({
  list: {
    margin: `${space.lg} 0`,
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: colors.ruleStrong,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: colors.ruleStrong,
  },
  row: {
    display: "grid",
    gridTemplateColumns: { default: "minmax(0, 2fr) minmax(0, 3fr)", [breakpoints.small]: "1fr" },
    gap: `${space.xxs} ${space.lg}`,
    paddingBlock: space.sm,
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: colors.rule,
    lineHeight: 1.45,
  },
  head: {
    display: { default: "grid", [breakpoints.small]: "none" },
    borderTopWidth: 0,
  },
  name: {
    display: "flex",
    flexDirection: "column",
    fontWeight: 600,
  },
  examples: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontStyle: "italic",
    fontWeight: 400,
  },
  uses: {
    margin: 0,
    fontSize: fontSizes.md,
  },
});
