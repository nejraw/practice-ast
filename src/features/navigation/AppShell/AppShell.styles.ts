import * as stylex from "@stylexjs/stylex";
import { breakpoints } from "@/design/layout.stylex";
import { colors, fontSizes, fonts, space } from "@/design/tokens.stylex";

export const styles = stylex.create({
  app: {
    display: "grid",
    gridTemplateColumns: { default: "280px minmax(0, 1fr)", [breakpoints.narrow]: "minmax(0, 1fr)" },
    // On narrow screens the top bar is a row of its own; only the page takes up spare
    // height, or a short page (a loading figure, "Page not found") stretches the bar.
    gridTemplateRows: { default: null, [breakpoints.narrow]: "auto 1fr" },
    minHeight: "100dvh",
    backgroundColor: colors.bg,
    // A faint dot grid, like graph paper or an editor's indentation guides.
    backgroundImage: `radial-gradient(${colors.rule} 1px, transparent 1.2px)`,
    backgroundSize: "22px 22px",
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: fontSizes.body,
    lineHeight: 1.6,
    fontOpticalSizing: "auto",
  },
  topBar: {
    display: { default: "none", [breakpoints.narrow]: "flex" },
    position: "sticky",
    top: 0,
    zIndex: 20,
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.md,
    padding: `${space.sm} ${space.md}`,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: colors.ruleStrong,
    backgroundColor: colors.bg,
  },
  menuButton: {
    padding: `${space.xs} ${space.sm}`,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.ruleStrong,
    borderRadius: 0,
    backgroundColor: "transparent",
    color: colors.text,
    fontFamily: fonts.code,
    fontSize: fontSizes.label,
    cursor: "pointer",
  },
  sidebar: {
    position: { default: "sticky", [breakpoints.narrow]: "fixed" },
    top: { default: 0, [breakpoints.narrow]: 45 },
    bottom: { default: null, [breakpoints.narrow]: 0 },
    left: 0,
    zIndex: 10,
    width: { default: null, [breakpoints.narrow]: "min(320px, 88vw)" },
    height: { default: "100dvh", [breakpoints.narrow]: null },
    overflowY: "auto",
    borderRightWidth: 1,
    borderRightStyle: "solid",
    borderRightColor: colors.rule,
    backgroundColor: colors.bg,
    transform: { default: null, [breakpoints.narrow]: "translateX(-100%)" },
    transition: "transform 200ms ease",
  },
  sidebarOpen: {
    transform: "none",
    borderRightColor: colors.ruleStrong,
  },
  main: {
    minWidth: 0,
  },
});
