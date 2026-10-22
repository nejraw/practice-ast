import { createContext, useContext, type ComponentPropsWithoutRef } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./Code.styles";

/** Lets `code` know whether it is a block (inside `pre`) or inline. */
const InPre = createContext(false);

/** A code block. Shiki has already coloured it at build time. */
export function Pre({ className, style, ...props }: ComponentPropsWithoutRef<"pre">) {
  const sx = stylex.props(styles.pre);
  // Keep Shiki's text colours but not its background: code sits on our paper.
  const { backgroundColor: _ignored, ...shikiStyle } = style ?? {};
  return (
    <InPre.Provider value={true}>
      <pre
        {...props}
        className={[className, sx.className].filter(Boolean).join(" ")}
        style={{ ...shikiStyle, ...sx.style }}
      />
    </InPre.Provider>
  );
}

/** Code in a block, or `inline` in the text. */
export function Code(props: ComponentPropsWithoutRef<"code">) {
  const inPre = useContext(InPre);
  return <code {...props} {...stylex.props(inPre ? styles.blockCode : styles.inlineCode)} />;
}
