import * as stylex from "@stylexjs/stylex";
import { colors, fontSizes, fonts, space } from "@/design/tokens.stylex";

export const styles = stylex.create({
  wrap: {
    margin: `${space.lg} 0`,
  },
  tape: {
    display: "flex",
    flexWrap: "wrap",
    margin: 0,
    padding: 0,
    listStyle: "none",
    borderLeftWidth: 1,
    borderLeftStyle: "solid",
    borderLeftColor: colors.ruleStrong,
  },
  cell: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: 30,
    marginBottom: space.xs,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderStyle: "solid",
    borderColor: colors.ruleStrong,
    backgroundColor: colors.surface,
  },
  char: {
    paddingTop: 4,
    fontFamily: fonts.code,
    fontSize: fontSizes.md,
    fontWeight: 500,
    lineHeight: 1.3,
  },
  invisible: {
    color: colors.accent,
  },
  index: {
    alignSelf: "stretch",
    paddingBlock: 1,
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: colors.rule,
    color: colors.textMuted,
    fontFamily: fonts.code,
    fontSize: 9.5,
    textAlign: "center",
  },
  caption: {
    margin: `${space.xs} 0 0`,
  },
});
