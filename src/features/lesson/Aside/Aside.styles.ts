import * as stylex from "@stylexjs/stylex";
import { breakpoints } from "@/design/layout.stylex";
import { colors, fontSizes, space } from "@/design/tokens.stylex";

export const styles = stylex.create({
  aside: {
    float: { default: "none", [breakpoints.wide]: "right" },
    clear: { default: null, [breakpoints.wide]: "right" },
    width: { default: "auto", [breakpoints.wide]: 220 },
    margin: {
      default: `0 0 ${space.md}`,
      [breakpoints.wide]: `${space.xxs} -260px ${space.md} 0`,
    },
    padding: { default: `0 0 0 ${space.md}`, [breakpoints.wide]: `0 0 0 ${space.sm}` },
    borderLeftWidth: 1,
    borderLeftStyle: "solid",
    borderLeftColor: colors.accent,
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    fontStyle: "italic",
    lineHeight: 1.5,
  },
});
