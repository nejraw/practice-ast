import * as stylex from "@stylexjs/stylex";
import { breakpoints, layout } from "@/design/layout.stylex";
import { colors, fontSizes, fonts, space } from "@/design/tokens.stylex";

export const styles = stylex.create({
  figure: {
    clear: "both",
    margin: {
      default: `${space.xl} 0`,
      [breakpoints.wide]: `${space.xl} calc(-1 * ${layout.marginColumn}) ${space.xl} 0`,
    },
    counterIncrement: "figure",
  },
  // An ink title bar, like the top of an editor window.
  caption: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: `${space.xs} ${space.md}`,
    padding: `6px ${space.md}`,
    backgroundColor: colors.barBg,
    color: colors.barText,
  },
  number: {
    color: colors.accent,
    "::before": {
      content: "'fig ' counter(lesson) '.' counter(figure)",
    },
  },
  title: {
    fontFamily: fonts.code,
    fontSize: fontSizes.xs,
  },
  actions: {
    display: "flex",
    gap: space.md,
    marginLeft: "auto",
  },
  body: {
    display: "flex",
    flexDirection: "column",
    gap: space.md,
    padding: space.md,
    borderWidth: 1,
    borderTopWidth: 0,
    borderStyle: "solid",
    borderColor: colors.barBg,
    backgroundColor: colors.surface,
  },
});
