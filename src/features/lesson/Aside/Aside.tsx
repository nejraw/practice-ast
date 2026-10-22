import type { ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./Aside.styles";

/** A margin note: beside the text on wide screens, inline (as an indented note) otherwise. */
export function Aside({ children }: { children: ReactNode }) {
  return <aside {...stylex.props(styles.aside)}>{children}</aside>;
}

