import * as stylex from "@stylexjs/stylex";
import type { Source } from "@/features/course";
import { shared } from "@/design/shared.styles";
import { sourceAnchor } from "@/features/lesson/SourcesContext";
import { styles } from "./Sources.styles";

/** The numbered list of sources at the end of a lesson, like references in a book. */
export function Sources({ items }: { items: Source[] }) {
  return (
    // data-sources tells the reading progress where the main path ends, when there is no "Going deeper".
    <section aria-labelledby="sources" data-sources {...stylex.props(styles.section)}>
      <h2 id="sources" {...stylex.props(shared.caption, styles.heading)}>
        // sources
      </h2>
      <ol {...stylex.props(styles.list)}>
        {items.map((source, i) => (
          <li key={source.id} id={sourceAnchor(source.id)} {...stylex.props(styles.item)}>
            <span {...stylex.props(styles.number)}>[{i + 1}]</span>
            <span>
              <span {...stylex.props(styles.citation)}>
                {source.by}
                {source.year !== undefined && ` (${source.year})`}.{" "}
                <a href={source.url} target="_blank" rel="noreferrer" {...stylex.props(styles.title)}>
                  {source.title}
                </a>
                {/[?!.]$/.test(source.title) ? " " : ". "}
                <em>{source.publication}</em>.
              </span>
              <span {...stylex.props(styles.usedFor)}>{source.usedFor}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
