import * as stylex from "@stylexjs/stylex";

// Paper and ink, with one accent. Dark mode is "ink on night paper", not a neon theme.
// Each colour is light-dark(light, dark): it follows the page's color-scheme, which the
// theme toggle sets (light, dark, or the system setting; see global.css).
export const colors = stylex.defineVars({
  bg: "light-dark(#f7f4ec, #161512)",
  surface: "light-dark(#fcfaf5, #1c1b17)",
  surfaceMuted: "light-dark(#efebe0, #24221d)",
  text: "light-dark(#1b1a17, #e9e4d8)",
  textMuted: "light-dark(#6d675b, #9d9687)",
  rule: "light-dark(#d8d2c3, #38352d)",
  ruleStrong: "light-dark(#1b1a17, #e9e4d8)",
  accent: "light-dark(#c8401c, #f0714c)",
  accentSoft: "light-dark(#f6dfd4, #3a2119)",
  // Figure frames and title bars: dark in both themes, like an editor's chrome.
  barBg: "light-dark(#1b1a17, #33302a)",
  barText: "light-dark(#f7f4ec, #e9e4d8)",
  focus: "light-dark(#f9e3a6, #4a3c14)",
  focusText: "light-dark(#1b1a17, #fbf3da)",

  // Syntax: restrained, ink-like hues. The operator gets the accent.
  keyword: "light-dark(#6a3f86, #c6a6e0)",
  identifier: "light-dark(#22507e, #8fb6e3)",
  number: "light-dark(#9a4a12, #e3a26a)",
  string: "light-dark(#3d6b33, #9cc98c)",
  regexp: "light-dark(#8b3557, #e597b6)",
  operator: "light-dark(#c8401c, #f0714c)",
  punctuation: "light-dark(#6d675b, #9d9687)",
  // At least 4.5:1 on bg, surface and surfaceMuted (WCAG AA for small text).
  comment: "light-dark(#6e685d, #8f8a80)",

  good: "light-dark(#3d6b33, #9cc98c)",
  goodSoft: "light-dark(#e1ead2, #1f2b1a)",
  bad: "light-dark(#b3261e, #f08a80)",
  badSoft: "light-dark(#f5dcd6, #3a1d19)",
});

export const space = stylex.defineVars({
  xxs: "2px",
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "40px",
  xxl: "64px",
});

export const fonts = stylex.defineVars({
  body: '"Source Serif 4 Variable", "Iowan Old Style", Georgia, serif',
  code: '"IBM Plex Mono", ui-monospace, Menlo, monospace',
});

export const fontSizes = stylex.defineVars({
  label: "11px",
  xs: "12.5px",
  sm: "14px",
  md: "16px",
  body: "18.5px",
  lg: "22px",
  xl: "30px",
  xxl: "46px",
});
