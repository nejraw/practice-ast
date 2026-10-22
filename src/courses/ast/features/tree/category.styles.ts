import * as stylex from "@stylexjs/stylex";
import { colors } from "@/design/tokens.stylex";

/** One colour per category, shared by tree rows, diagram boxes and token chips. */
export const categoryText = stylex.create({
  identifier: { color: colors.identifier },
  number: { color: colors.number },
  string: { color: colors.string },
  regexp: { color: colors.regexp },
  keyword: { color: colors.keyword },
  operator: { color: colors.operator },
  punctuation: { color: colors.punctuation },
  node: { color: colors.text },
});

export const categoryColor = {
  identifier: colors.identifier,
  number: colors.number,
  string: colors.string,
  regexp: colors.regexp,
  keyword: colors.keyword,
  operator: colors.operator,
  punctuation: colors.punctuation,
  node: colors.textMuted,
} as const;
