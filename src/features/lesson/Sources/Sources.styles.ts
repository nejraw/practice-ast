import * as stylex from "@stylexjs/stylex";
import { colors, fontSizes, fonts, space } from "@/design/tokens.stylex";

export const styles = stylex.create({
  section: {
    clear: "both",
    marginTop: space.xxl,
    paddingTop: space.md,
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: colors.rule,
  },
  heading: {
    margin: `0 0 ${space.md}`,
    textTransform: "none",
    letterSpacing: "0.02em",
    fontSize: fontSizes.xs,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: space.sm,
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  item: {
    display: "grid",
    gridTemplateColumns: "4ch minmax(0, 1fr)",
    gap: space.xs,
    fontSize: fontSizes.md,
    lineHeight: 1.45,
    scrollMarginTop: space.xxl,
    ":target": { backgroundColor: colors.focus },
  },
  number: {
    color: colors.accent,
    fontFamily: fonts.code,
    fontSize: fontSizes.sm,
  },
  citation: {
    display: "block",
  },
  title: {
    color: "inherit",
    fontWeight: 600,
    textDecorationColor: colors.accent,
    textUnderlineOffset: 3,
    overflowWrap: "anywhere",
  },
  usedFor: {
    display: "block",
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontStyle: "italic",
  },
});
