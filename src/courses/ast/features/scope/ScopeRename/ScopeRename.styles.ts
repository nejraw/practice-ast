import * as stylex from "@stylexjs/stylex";
import { colors, fontSizes, fonts, space } from "@/design/tokens.stylex";
import { breakpoints } from "@/design/layout.stylex";

export const styles = stylex.create({
  controls: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "baseline",
    gap: `${space.xs} ${space.sm}`,
    margin: 0,
    fontSize: fontSizes.md,
  },
  name: {
    color: colors.identifier,
    fontFamily: fonts.code,
    fontWeight: 600,
  },
  muted: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
  },
  input: {
    width: "12ch",
    padding: "1px 0",
    borderWidth: 0,
    borderBottomWidth: 1,
    borderStyle: "solid",
    borderColor: { default: colors.ruleStrong, ":focus": colors.accent },
    borderRadius: 0,
    outline: "none",
    backgroundColor: "transparent",
    color: colors.identifier,
    fontFamily: fonts.code,
    fontSize: fontSizes.md,
  },
  columns: {
    display: "grid",
    gridTemplateColumns: { default: "minmax(0, 1fr) minmax(0, 1fr)", [breakpoints.stackColumns]: "1fr" },
    gap: space.md,
  },
  column: {
    display: "flex",
    flexDirection: "column",
    gap: space.sm,
    minWidth: 0,
  },
  verdict: {
    margin: 0,
    fontSize: fontSizes.sm,
    fontStyle: "italic",
  },
  good: {
    color: colors.good,
  },
  bad: {
    color: colors.bad,
  },
});
