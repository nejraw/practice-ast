import * as stylex from "@stylexjs/stylex";
import { Link } from "@tanstack/react-router";
import { styles } from "./OpenInExplorer.styles";

/** A figure action: the same code, in the full Explorer. */
export function OpenInExplorer({ code }: { code: string }) {
  return (
    <Link to="/explorer" search={{ code }} {...stylex.props(styles.link)}>
      Open in Explorer →
    </Link>
  );
}
