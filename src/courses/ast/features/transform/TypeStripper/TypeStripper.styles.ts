import * as stylex from "@stylexjs/stylex";
import { colors, fontSizes, fonts, space } from "@/design/tokens.stylex";

export const styles = stylex.create({
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: space.xs,
  },
  // Stacked at full width, without wrapping, so the blanked output lines up with the source.
  columns: {
    display: "flex",
    flexDirection: "column",
    gap: space.md,
  },
  column: {
    display: "flex",
    flexDirection: "column",
    gap: space.sm,
    minWidth: 0,
  },
  name: {
    color: colors.accent,
    fontFamily: fonts.code,
    fontWeight: 600,
  },
  readout: {
    margin: 0,
    fontSize: fontSizes.sm,
  },
  good: {
    color: colors.good,
  },
  moved: {
    color: colors.bad,
  },
  error: {
    margin: 0,
    color: colors.bad,
    fontFamily: fonts.code,
    fontSize: fontSizes.xs,
  },
});
