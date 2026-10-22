import * as stylex from "@stylexjs/stylex";
import { Link } from "@tanstack/react-router";
import { styles } from "./NotFound.styles";

export function NotFound() {
  return (
    <div {...stylex.props(styles.notFound)}>
      <h1>Page not found</h1>
      <p>
        <Link to="/">Back to the contents</Link>
      </p>
    </div>
  );
}
