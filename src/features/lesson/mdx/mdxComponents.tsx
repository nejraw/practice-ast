import * as stylex from "@stylexjs/stylex";
import type { MDXComponents } from "mdx/types";
import { Anchor } from "./Anchor";
import { Code, Pre } from "./Code";
import { styles } from "./mdxComponents.styles";

/** How the Markdown in a lesson renders: the book's typography. */
export const mdxComponents: MDXComponents = {
  h2: (props) => <h2 {...props} {...stylex.props(styles.h2)} />,
  h3: (props) => <h3 {...props} {...stylex.props(styles.h3)} />,
  p: (props) => <p {...props} {...stylex.props(styles.p)} />,
  ul: (props) => <ul {...props} {...stylex.props(styles.list)} />,
  ol: (props) => <ol {...props} {...stylex.props(styles.list)} />,
  li: (props) => <li {...props} {...stylex.props(styles.li)} />,
  a: Anchor,
  strong: (props) => <strong {...props} {...stylex.props(styles.strong)} />,
  blockquote: (props) => <blockquote {...props} {...stylex.props(styles.blockquote)} />,
  hr: (props) => <hr {...props} {...stylex.props(styles.hr)} />,
  table: (props) => (
    <div {...stylex.props(styles.tableWrap)}>
      <table {...props} {...stylex.props(styles.table)} />
    </div>
  ),
  th: (props) => <th {...props} {...stylex.props(styles.th)} />,
  td: (props) => <td {...props} {...stylex.props(styles.td)} />,
  pre: Pre,
  code: Code,
};

