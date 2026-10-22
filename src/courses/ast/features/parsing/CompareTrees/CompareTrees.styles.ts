import * as stylex from "@stylexjs/stylex";
import { colors, space } from "@/design/tokens.stylex";
import { breakpoints } from "@/design/layout.stylex";

export const styles = stylex.create({
  variants: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space.xs,
  },
  columns: {
    display: "grid",
    gridTemplateColumns: { default: "1fr 1fr", [breakpoints.stackColumns]: "1fr" },
  },
  column: {
    display: "flex",
    flexDirection: "column",
    gap: space.sm,
    minWidth: 0,
    paddingRight: { default: space.md, [breakpoints.stackColumns]: 0 },
  },
  secondColumn: {
    paddingLeft: { default: space.md, [breakpoints.stackColumns]: 0 },
    paddingRight: 0,
    paddingTop: { default: 0, [breakpoints.stackColumns]: space.md },
    borderLeftWidth: { default: 1, [breakpoints.stackColumns]: 0 },
    borderLeftStyle: "solid",
    borderLeftColor: colors.rule,
    borderTopWidth: { default: 0, [breakpoints.stackColumns]: 1 },
    borderTopStyle: "solid",
    borderTopColor: colors.rule,
  },
});
