import * as stylex from "@stylexjs/stylex";
import { colors, fontSizes, fonts, space } from "@/design/tokens.stylex";

export const styles = stylex.create({
  row: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space.xs,
  },
  spacer: {
    flexGrow: 1,
  },
  output: {
    display: "flex",
    flexDirection: "column",
    gap: space.xxs,
    padding: `${space.sm} ${space.md}`,
    borderLeftWidth: 2,
    borderLeftStyle: "solid",
    borderLeftColor: colors.ruleStrong,
    backgroundColor: colors.surfaceMuted,
    fontFamily: fonts.code,
    fontSize: fontSizes.sm,
    lineHeight: 1.6,
  },
  muted: {
    color: colors.textMuted,
  },
  log: {
    whiteSpace: "pre-wrap",
  },
  errorLine: {
    color: colors.bad,
    whiteSpace: "pre-wrap",
  },
  explain: {
    margin: 0,
    fontSize: fontSizes.md,
    fontStyle: "italic",
  },
});
