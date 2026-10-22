import * as stylex from "@stylexjs/stylex";
import { colors, fonts } from "@/design/tokens.stylex";

const blink = stylex.keyframes({
  "0%, 49%": { opacity: 1 },
  "50%, 100%": { opacity: 0 },
});

export const styles = stylex.create({
  mark: {
    fontFamily: fonts.code,
    fontWeight: 600,
    letterSpacing: "-0.03em",
  },
  large: {
    display: "flex",
    alignItems: "center",
    fontSize: 19,
    lineHeight: 1.1,
  },
  topic: {
    color: colors.accent,
  },
  caret: {
    display: "inline-block",
    width: 9,
    height: 19,
    marginLeft: 3,
    backgroundColor: colors.accent,
    animationName: { default: blink, "@media (prefers-reduced-motion: reduce)": "none" },
    animationDuration: "1.1s",
    animationIterationCount: "infinite",
  },
});
