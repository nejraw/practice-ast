import * as stylex from "@stylexjs/stylex";

export const breakpoints = stylex.defineConsts({
  /** Wide enough for a margin column next to the text, like notes in a book. */
  wide: "@media (min-width: 1320px)",
  /** Below this, the sidebar folds away behind a menu in a sticky top bar (45px tall). */
  narrow: "@media (max-width: 900px)",
  small: "@media (max-width: 640px)",
  /** Below this, side-by-side columns in a figure stack. */
  stackColumns: "@media (max-width: 760px)",
});

export const layout = stylex.defineConsts({
  marginColumn: "260px",
  textColumn: "680px",
});
