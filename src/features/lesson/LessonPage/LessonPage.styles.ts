import * as stylex from "@stylexjs/stylex";
import { breakpoints, layout } from "@/design/layout.stylex";
import { colors, fontSizes, fonts, space } from "@/design/tokens.stylex";

export const styles = stylex.create({
  page: {
    maxWidth: { default: 720, [breakpoints.wide]: `calc(${layout.textColumn} + ${layout.marginColumn} + 80px)` },
    margin: "0 auto",
    paddingTop: { default: space.xxl, [breakpoints.small]: space.lg },
    paddingBottom: space.xl,
    paddingLeft: { default: space.xl, [breakpoints.small]: space.md },
    paddingRight: {
      default: space.xl,
      [breakpoints.small]: space.md,
      [breakpoints.wide]: `calc(${layout.marginColumn} + ${space.xl})`,
    },
  },
  header: {
    marginBottom: space.xl,
  },
  eyebrow: {
    margin: `0 0 ${space.sm}`,
    textTransform: "none",
    letterSpacing: "0.04em",
    fontSize: fontSizes.xs,
  },
  accent: {
    color: colors.accent,
  },
  title: {
    margin: `0 0 ${space.lg}`,
    paddingBottom: space.lg,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: colors.ruleStrong,
    fontFamily: fonts.code,
    fontSize: { default: 40, [breakpoints.small]: 30 },
    fontWeight: 600,
    lineHeight: 1.1,
    letterSpacing: "-0.03em",
  },
  docComment: {
    display: "flex",
    flexDirection: "column",
    color: colors.comment,
    fontFamily: fonts.code,
    fontSize: fontSizes.sm,
    lineHeight: 1.6,
  },
  docBody: {
    margin: 0,
    marginLeft: "0.6ch",
    paddingLeft: "1.6ch",
    borderLeftWidth: 1,
    borderLeftStyle: "dashed",
    borderLeftColor: colors.comment,
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: fontSizes.lg,
    fontStyle: "italic",
    lineHeight: 1.45,
  },
  docTag: {
    color: colors.keyword,
    fontFamily: fonts.code,
    fontSize: fontSizes.sm,
    fontStyle: "normal",
    fontWeight: 600,
  },
  muted: {
    color: colors.textMuted,
  },
  pager: {
    display: "grid",
    gridTemplateColumns: { default: "1fr 1fr", [breakpoints.small]: "1fr" },
    gap: space.lg,
    marginTop: space.xxl,
    paddingTop: space.md,
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: colors.ruleStrong,
  },
  pagerLink: {
    display: "flex",
    flexDirection: "column",
    gap: space.xs,
    color: { default: colors.text, ":hover": colors.accent },
    fontSize: fontSizes.lg,
    textDecoration: "none",
  },
  pagerNext: {
    gridColumn: { default: 2, [breakpoints.small]: 1 },
    textAlign: "right",
  },
  pagerCall: {
    color: colors.identifier,
    fontFamily: fonts.code,
    fontSize: fontSizes.sm,
  },
  pagerNumber: {
    color: colors.accent,
    fontFamily: fonts.code,
    fontSize: fontSizes.sm,
  },
});
