import * as stylex from "@stylexjs/stylex";
import { breakpoints } from "@/design/layout.stylex";
import { colors, fontSizes, fonts, space } from "@/design/tokens.stylex";

export const styles = stylex.create({
  page: {
    maxWidth: 1400,
    margin: "0 auto",
    padding: {
      default: `${space.xl} ${space.xl}`,
      [breakpoints.small]: `${space.lg} ${space.md}`,
    },
  },
  header: {
    marginBottom: space.lg,
    paddingBottom: space.md,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: colors.ruleStrong,
  },
  eyebrow: {
    margin: `0 0 ${space.xs}`,
    color: colors.accent,
    textTransform: "none",
  },
  title: {
    margin: `0 0 ${space.xs}`,
    fontFamily: fonts.code,
    fontSize: fontSizes.xl,
    fontWeight: 600,
    letterSpacing: "-0.03em",
  },
  lead: {
    margin: 0,
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontStyle: "italic",
  },
});
