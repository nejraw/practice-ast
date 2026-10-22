import { HighlightStyle } from "@codemirror/language";
import { EditorView } from "@codemirror/view";
import { tags } from "@lezer/highlight";
import { colors, fontSizes, fonts } from "@/design/tokens.stylex";

// StyleX variables resolve to `var(--…)` strings, so CodeMirror follows the
// same tokens, and dark mode, as the rest of the app.
export const editorTheme = EditorView.theme({
  "&": {
    backgroundColor: "transparent",
    color: colors.text,
    fontSize: fontSizes.sm,
  },
  "&.cm-focused": { outline: "none" },
  ".cm-scroller": { fontFamily: fonts.code, lineHeight: "1.7" },
  ".cm-content": { padding: "10px 0", caretColor: colors.accent },
  ".cm-line": { padding: "0 14px" },
  ".cm-gutters": {
    backgroundColor: "transparent",
    color: colors.comment,
    border: "none",
    paddingLeft: "6px",
  },
  ".cm-activeLine": { backgroundColor: "transparent" },
  "&.cm-focused .cm-activeLine": { backgroundColor: colors.surfaceMuted },
  ".cm-activeLineGutter": { backgroundColor: "transparent", color: colors.text },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection": {
    backgroundColor: `${colors.focus} !important`,
  },
  ".cm-cursor": { borderLeftColor: colors.accent, borderLeftWidth: "2px" },
  ".cm-placeholder": { color: colors.comment },
  ".cm-ast-focus": { backgroundColor: colors.focus, color: colors.focusText },
  ".cm-ast-focus *": { color: `${colors.focusText} !important` },
  // The squiggle is a small wave image used as a mask over the theme's colour, so it
  // follows light and dark mode. A wavy text-decoration has waves so wide that a
  // one-character error got a single bump that was easy to miss.
  ".cm-ast-error": {
    position: "relative",
    backgroundColor: colors.badSoft,
  },
  ".cm-ast-error::after": {
    content: '""',
    position: "absolute",
    left: 0,
    right: 0,
    bottom: "-3px",
    height: "4px",
    backgroundColor: colors.bad,
    maskImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='4' height='4'><path d='M0 3 L2 1 L4 3' fill='none' stroke='black' stroke-width='1.3'/></svg>")`,
    maskSize: "4px 4px",
    maskRepeat: "repeat-x",
    pointerEvents: "none",
  },
  ".cm-ast-error-end": {
    display: "inline-block",
    width: "1ch",
    height: "1em",
    verticalAlign: "text-bottom",
  },
  ".cm-ast-good": { backgroundColor: colors.goodSoft, boxShadow: `inset 0 -1px 0 ${colors.good}` },
  ".cm-ast-bad": {
    backgroundColor: colors.badSoft,
    boxShadow: `inset 0 -1px 0 ${colors.bad}`,
    textDecoration: `line-through ${colors.bad}`,
  },
});

export const editorHighlightStyle = HighlightStyle.define([
  { tag: [tags.keyword, tags.modifier, tags.controlKeyword, tags.operatorKeyword, tags.bool, tags.null], color: colors.keyword },
  { tag: [tags.variableName, tags.propertyName, tags.definition(tags.variableName)], color: colors.identifier },
  { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], color: colors.identifier },
  { tag: [tags.number], color: colors.number },
  { tag: [tags.string, tags.special(tags.string)], color: colors.string },
  { tag: [tags.regexp], color: colors.regexp },
  { tag: [tags.operator, tags.arithmeticOperator, tags.logicOperator, tags.compareOperator], color: colors.operator },
  { tag: [tags.punctuation, tags.bracket, tags.separator], color: colors.punctuation },
  { tag: [tags.comment, tags.lineComment, tags.blockComment], color: colors.comment, fontStyle: "italic" },
]);
