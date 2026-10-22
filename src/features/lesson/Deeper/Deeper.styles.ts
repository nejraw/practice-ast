import * as stylex from "@stylexjs/stylex";
import { colors, fontSizes, fonts, space } from "@/design/tokens.stylex";

export const styles = stylex.create({
  details: {
    clear: "both",
    margin: `${space.xxl} 0 ${space.lg}`,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderStyle: "solid",
    borderColor: colors.ruleStrong,
    borderLeftWidth: 0,
    borderRightWidth: 0,
  },
  summary: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "baseline",
    gap: `0 ${space.md}`,
    padding: `${space.md} 0`,
    cursor: "pointer",
    listStyle: "none",
    "::-webkit-details-marker": { display: "none" },
    ":hover": { color: colors.accent },
  },
  marker: {
    color: colors.accent,
    fontFamily: fonts.code,
  },
  title: {
    fontFamily: fonts.code,
    fontSize: 20,
    fontWeight: 600,
  },
  note: {
    color: colors.textMuted,
    fontFamily: fonts.code,
    fontSize: fontSizes.xs,
  },
  body: {
    paddingBottom: space.lg,
  },
});
