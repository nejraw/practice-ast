import { useState, type ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { useHydrated } from "@tanstack/react-router";
import { Code, Pre } from "@/features/lesson/mdx/Code";
import { styles } from "./Check.styles";

/** Splits `inline code` out of a plain string, so questions can be props. */
function withInlineCode(text: string) {
  return text.split(/`([^`]+)`/).map((part, i) => (i % 2 ? <Code key={i}>{part}</Code> : part));
}

/** A question to answer in your head before revealing the answer. */
export function Check({ question, code, children }: { question: string; code?: string; children: ReactNode }) {
  const [shown, setShown] = useState(false);
  // On a prerendered page the button does nothing until JavaScript has loaded.
  // Not `disabled`: Firefox restores that on reload, which breaks hydration.
  const hydrated = useHydrated();
  return (
    <section aria-label="Check yourself" {...stylex.props(styles.check)}>
      <span {...stylex.props(styles.label)}>// check yourself</span>
      <p {...stylex.props(styles.question)}>{withInlineCode(question)}</p>
      {code && (
        <Pre>
          <Code>{code}</Code>
        </Pre>
      )}
      {shown ? (
        <div {...stylex.props(styles.answer)}>{children}</div>
      ) : (
        <button
          type="button"
          aria-disabled={!hydrated}
          onClick={() => setShown(true)}
          {...stylex.props(styles.button, !hydrated && styles.waiting)}
        >
          Show the answer
        </button>
      )}
    </section>
  );
}

