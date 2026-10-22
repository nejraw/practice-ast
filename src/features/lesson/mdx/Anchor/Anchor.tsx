import type { ComponentPropsWithoutRef } from "react";
import * as stylex from "@stylexjs/stylex";
import { Link } from "@tanstack/react-router";
import { styles } from "./Anchor.styles";

/** A link in the text: through the router within the site, a new tab outside it. */
export function Anchor(props: ComponentPropsWithoutRef<"a">) {
  // Links within the app go through the router, so the page doesn't reload.
  if (props.href?.startsWith("/")) {
    const { href, ...rest } = props;
    return <Link {...rest} to={href} {...stylex.props(styles.link)} />;
  }
  const external = props.href?.startsWith("http");
  return (
    <a
      {...props}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      {...stylex.props(styles.link)}
    />
  );
}

