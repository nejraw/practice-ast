import * as stylex from "@stylexjs/stylex";
import { Loader } from "@/design/components/Loader";
import { styles } from "./Pending.styles";

/**
 * What a prerendered page shows in place of something interactive until the
 * JavaScript has taken over: the loader, room for what's coming, and a note for
 * readers without JavaScript.
 */
export function Pending({ label }: { label: string }) {
  return (
    <div {...stylex.props(styles.pending)}>
      <div data-pending-loader>
        <Loader label={label} />
      </div>
      {/* Without JavaScript nothing is coming, so say so instead of loading forever. */}
      <noscript>
        <style>{"[data-pending-loader] { display: none; }"}</style>
        <p {...stylex.props(styles.note)}>// this part is interactive and needs JavaScript</p>
      </noscript>
    </div>
  );
}
