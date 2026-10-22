import * as stylex from "@stylexjs/stylex";
import { styles } from "./TreeVerdict.styles";

/** Whether two pieces of code gave the same tree. */
export function TreeVerdict({ same }: { same: boolean }) {
  return (
    <p role="status" {...stylex.props(styles.verdict, same ? styles.same : styles.different)}>
      {same ? "Same tree." : "Different trees."}
    </p>
  );
}
