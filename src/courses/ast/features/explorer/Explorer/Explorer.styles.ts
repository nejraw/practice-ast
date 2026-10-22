import * as stylex from "@stylexjs/stylex";
import { colors, fontSizes, fonts, space } from "@/design/tokens.stylex";

const WIDE = "@media (min-width: 1100px)";

export const styles = stylex.create({
  layout: {
    display: "grid",
    gridTemplateColumns: { default: "minmax(0, 1fr)", [WIDE]: "minmax(0, 1fr) minmax(0, 1fr)" },
    gap: space.xl,
    alignItems: "start",
  },
  column: {
    display: "flex",
    flexDirection: "column",
    gap: space.md,
    minWidth: 0,
  },
  toolbar: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space.xs,
    minHeight: 30,
  },
  toolbarLabel: {
    marginRight: space.xs,
  },
  checkbox: {
    display: "flex",
    alignItems: "center",
    gap: space.xs,
    marginLeft: "auto",
    color: colors.textMuted,
    fontFamily: fonts.code,
    fontSize: fontSizes.xs,
  },
  treePanel: {
    maxHeight: { default: "70vh", [WIDE]: "calc(100dvh - 200px)" },
    overflow: "auto",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.ruleStrong,
    backgroundColor: colors.surface,
  },
  error: {
    margin: 0,
    paddingLeft: space.md,
    borderLeftWidth: 2,
    borderLeftStyle: "solid",
    borderLeftColor: colors.bad,
    color: colors.bad,
    fontSize: fontSizes.sm,
  },
  errorHint: {
    color: colors.textMuted,
    fontStyle: "italic",
  },
  empty: {
    margin: 0,
    padding: space.lg,
    color: colors.textMuted,
    fontStyle: "italic",
  },
});
