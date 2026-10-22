import * as stylex from "@stylexjs/stylex";
import { styles } from "./BrandMark.styles";

/**
 * The series mark, practice(<topic>): the course's topic as the argument. The
 * large version, at the top of the sidebar, ends in a blinking caret.
 */
export function BrandMark({ topic, large = false }: { topic: string; large?: boolean }) {
  return (
    <span {...stylex.props(styles.mark, large && styles.large)}>
      practice(<span {...stylex.props(styles.topic)}>{topic}</span>)
      {large && <span {...stylex.props(styles.caret)} aria-hidden />}
    </span>
  );
}
