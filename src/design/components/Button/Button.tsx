import type { ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./Button.styles";

/** A small square button. `active` marks the chosen one of a set; `primary` is the main action. */
export function Button({
  children,
  onClick,
  active = false,
  disabled = false,
  primary = false,
}: {
  children: ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={primary ? undefined : active}
      {...stylex.props(styles.button, active && styles.active, primary && styles.primary)}
    >
      {children}
    </button>
  );
}
