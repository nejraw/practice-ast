import { useContext } from "react";
import * as stylex from "@stylexjs/stylex";
import { SourcesContext, sourceAnchor } from "@/features/lesson/SourcesContext";
import { styles } from "./Cite.styles";

/** An inline reference like "[3]", linking to the lesson's list of sources. */
export function Cite({ id }: { id: string }) {
  const items = useContext(SourcesContext);
  const index = items.findIndex((source) => source.id === id);
  if (index < 0) throw new Error(`Unknown source "${id}"`);
  return (
    <sup {...stylex.props(styles.cite)}>
      <a href={`#${sourceAnchor(id)}`} title={items[index].title} {...stylex.props(styles.link)}>
        [{index + 1}]
      </a>
    </sup>
  );
}
