import * as stylex from "@stylexjs/stylex";
import { breakpoints } from "@/design/layout.stylex";
import { colors, fontSizes, fonts, space } from "@/design/tokens.stylex";

export const styles = stylex.create({
  page: {
    maxWidth: 760,
    margin: "0 auto",
    padding: {
      default: `${space.xxl} ${space.xl}`,
      [breakpoints.small]: `${space.lg} ${space.md}`,
    },
  },
  titleBlock: {
    marginBottom: space.xxl,
    paddingBottom: space.xl,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: colors.ruleStrong,
  },
  comment: {
    margin: 0,
    color: colors.comment,
    fontFamily: fonts.code,
    fontSize: fontSizes.sm,
  },
  title: {
    margin: `${space.sm} 0 ${space.lg}`,
    fontFamily: fonts.code,
    fontSize: { default: 54, [breakpoints.small]: 34 },
    fontWeight: 600,
    lineHeight: 1.05,
    letterSpacing: "-0.05em",
  },
  semicolon: {
    color: colors.accent,
  },
  arg: {
    color: colors.string,
  },
  lead: {
    maxWidth: 600,
    margin: `0 0 ${space.lg}`,
    fontSize: fontSizes.lg,
    fontStyle: "italic",
    lineHeight: 1.5,
  },
  start: {
    color: colors.accent,
    fontFamily: fonts.code,
    fontSize: fontSizes.sm,
    fontWeight: 500,
    textDecoration: { default: "none", ":hover": "underline" },
  },
  contentsHeading: {
    margin: `0 0 ${space.md}`,
    textTransform: "none",
  },
  contents: {
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  entry: {
    display: "flex",
    gap: space.md,
    paddingBlock: space.sm,
    color: { default: colors.text, ":hover": colors.accent },
    textDecoration: "none",
  },
  entryNumber: {
    flexShrink: 0,
    width: 28,
    paddingTop: 5,
    color: colors.accent,
    fontFamily: fonts.code,
    fontSize: fontSizes.sm,
  },
  entryText: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
  },
  entryTitle: {
    fontFamily: fonts.code,
    fontSize: fontSizes.md,
    fontWeight: 600,
    letterSpacing: "-0.02em",
  },
  entryGoal: {
    color: colors.textMuted,
    fontSize: fontSizes.md,
    fontStyle: "italic",
    lineHeight: 1.45,
  },
  entryTime: {
    color: colors.textMuted,
    fontFamily: fonts.code,
    fontSize: fontSizes.xs,
  },
  entryFinished: {
    color: colors.good,
  },
});
