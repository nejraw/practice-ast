import * as stylex from "@stylexjs/stylex";
import { explain } from "@/courses/ast/engine/tree/explain";
import type { Positioned } from "@/courses/ast/engine/parsing/parse";
import { styles } from "./NodeInfo.styles";

export interface NodeInfoProps {
  path: Positioned[];
  code: string;
  onSelect?: (node: Positioned) => void;
}

const MAX_SNIPPET = 160;

export function NodeInfo({ path, code, onSelect }: NodeInfoProps) {
  const node = path.at(-1);
  if (!node) {
    return (
      <div {...stylex.props(styles.panel, styles.empty)}>
        Click a node in the tree, or put your cursor somewhere in the code.
      </div>
    );
  }

  const doc = explain(node.type);
  const source = code.slice(node.start, node.end);
  const snippet = source.length > MAX_SNIPPET ? `${source.slice(0, MAX_SNIPPET)}…` : source;

  return (
    <div {...stylex.props(styles.panel)} aria-live="polite">
      <ol aria-label="Path from the root" {...stylex.props(styles.breadcrumb)}>
        {path.map((step, i) => (
          <li key={i} {...stylex.props(styles.crumb)}>
            {i > 0 && <span aria-hidden>›</span>}
            <button type="button" onClick={() => onSelect?.(step)} {...stylex.props(styles.crumbButton)}>
              {step.type}
            </button>
          </li>
        ))}
      </ol>

      <h3 {...stylex.props(styles.type)}>{node.type}</h3>
      <p {...stylex.props(styles.summary)}>{doc.summary}</p>

      {doc.fields && (
        <dl {...stylex.props(styles.fields)}>
          {Object.entries(doc.fields).map(([field, description]) => (
            <div key={field} {...stylex.props(styles.fieldRow)}>
              <dt {...stylex.props(styles.fieldName)}>{field}</dt>
              <dd {...stylex.props(styles.fieldDescription)}>{description}</dd>
            </div>
          ))}
        </dl>
      )}

      <p {...stylex.props(styles.label)}>
        Source, characters {node.start}–{node.end}
      </p>
      <pre {...stylex.props(styles.snippet)}>{snippet || " "}</pre>
    </div>
  );
}
