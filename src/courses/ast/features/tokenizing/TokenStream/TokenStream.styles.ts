import * as stylex from "@stylexjs/stylex";
import { colors, fontSizes, fonts, space } from "@/design/tokens.stylex";

export const textColor = stylex.create({
  name: { color: colors.identifier },
  keyword: { color: colors.keyword },
  number: { color: colors.number },
  string: { color: colors.string },
  template: { color: colors.string },
  regexp: { color: colors.regexp },
  operator: { color: colors.operator },
  punctuation: { color: colors.punctuation },
});

export const styles = stylex.create({
  presets: {
    display: "flex",
    flexWrap: "wrap",
    gap: space.xs,
  },
  stream: {
    display: "flex",
    flexWrap: "wrap",
    gap: `${space.sm} 3px`,
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  piece: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: 30,
    borderWidth: 1,
    borderStyle: "solid",
    cursor: "default",
  },
  token: {
    borderColor: colors.ruleStrong,
    backgroundColor: colors.surface,
  },
  skipped: {
    minWidth: 20,
    borderColor: colors.rule,
    borderStyle: "dashed",
    backgroundColor: "transparent",
    opacity: 0.75,
  },
  newline: {
    borderColor: colors.accent,
    opacity: 1,
  },
  active: {
    borderColor: colors.accent,
    backgroundColor: colors.focus,
    opacity: 1,
  },
  errorPiece: {
    borderColor: colors.bad,
    backgroundColor: colors.badSoft,
    color: colors.bad,
  },
  text: {
    padding: "3px 6px 1px",
    fontFamily: fonts.code,
    fontSize: fontSizes.md,
    fontWeight: 500,
    lineHeight: 1.3,
    whiteSpace: "pre",
  },
  skippedText: {
    color: colors.comment,
    fontWeight: 400,
  },
  label: {
    alignSelf: "stretch",
    padding: "1px 4px",
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: colors.rule,
    color: colors.textMuted,
    fontFamily: fonts.code,
    fontSize: 9.5,
    textAlign: "center",
    whiteSpace: "nowrap",
  },
  summary: {
    margin: 0,
  },
  muted: {
    color: colors.textMuted,
  },
  error: {
    margin: 0,
    color: colors.bad,
    fontFamily: fonts.code,
    fontSize: fontSizes.xs,
  },
});
