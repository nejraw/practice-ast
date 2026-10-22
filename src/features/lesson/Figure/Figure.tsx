import type { ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { ClientOnly } from "@tanstack/react-router";
import { shared } from "@/design/shared.styles";
import { Pending } from "@/design/components/Pending";
import { styles } from "./Figure.styles";

/**
 * The frame around every hands-on part of a lesson, numbered like a figure in
 * a book ("Fig. 2.3"). On wide screens it extends into the margin column.
 *
 * The frame and title are part of the prerendered page; what's inside only
 * works with JavaScript, so until the page has hydrated it shows a loader.
 */
export function Figure({ title, children, actions }: { title: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <figure aria-label={title} {...stylex.props(styles.figure)}>
      <figcaption {...stylex.props(styles.caption)}>
        <span {...stylex.props(shared.caption, styles.number)} />
        <span {...stylex.props(styles.title)}>{title}</span>
        {actions && <span {...stylex.props(styles.actions)}>{actions}</span>}
      </figcaption>
      <div {...stylex.props(styles.body)}>
        <ClientOnly fallback={<Pending label="loading the figure…" />}>{children}</ClientOnly>
      </div>
    </figure>
  );
}
