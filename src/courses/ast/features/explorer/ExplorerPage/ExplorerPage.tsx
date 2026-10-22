import * as stylex from "@stylexjs/stylex";
import { ClientOnly } from "@tanstack/react-router";
import { Explorer } from "@/courses/ast/features/explorer/Explorer";
import { Pending } from "@/design/components/Pending";
import { shared } from "@/design/shared.styles";
import { styles } from "./ExplorerPage.styles";

/** The Explorer as a page of its own. `code` comes from an "Open in Explorer" link. */
export function ExplorerPage({ code }: { code?: string }) {
  return (
    <div {...stylex.props(styles.page)}>
      <header {...stylex.props(styles.header)}>
        <p {...stylex.props(shared.caption, styles.eyebrow)}>tools/explorer</p>
        <h1 {...stylex.props(styles.title)}>The Explorer</h1>
        <p {...stylex.props(styles.lead)}>
          Write any JavaScript and see its tree. Hover a node to highlight its source, or put your cursor in the code
          to find its node.
        </p>
      </header>
      <ClientOnly fallback={<Pending label="loading the explorer…" />}>
        {/* Remount when arriving with different code from an "Open in Explorer" link. */}
        <Explorer key={code} initialCode={code} />
      </ClientOnly>
    </div>
  );
}
