import { useState, type ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./Deeper.styles";

/** Optional material for the curious, folded away so the main path stays short. */
export function Deeper({ about, children }: { about: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    // data-deeper lets the reading progress tell optional material from the main path.
    <details data-deeper onToggle={(event) => setOpen(event.currentTarget.open)} {...stylex.props(styles.details)}>
      <summary {...stylex.props(styles.summary)}>
        <span aria-hidden {...stylex.props(styles.marker)}>
          {open ? "▾" : "▸"}
        </span>
        <span {...stylex.props(styles.title)}>Going deeper</span>
        <span {...stylex.props(styles.note)}>optional · {about}</span>
      </summary>
      <div {...stylex.props(styles.body)}>{children}</div>
    </details>
  );
}

