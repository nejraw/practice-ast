import * as stylex from "@stylexjs/stylex";
import { shared } from "@/design/shared.styles";
import { styles } from "./CharacterStrip.styles";

const VISIBLE = { " ": "␣", "\n": "↵", "\t": "⇥" } as Record<string, string | undefined>;

/** Code the way the engine first receives it: a tape of characters, one per cell. */
export function CharacterStrip({ code }: { code: string }) {
  const characters = [...code];
  return (
    <div {...stylex.props(styles.wrap)}>
      <ol aria-label={`${characters.length} characters`} {...stylex.props(styles.tape)}>
        {characters.map((char, i) => (
          <li key={i} {...stylex.props(styles.cell)}>
            <span {...stylex.props(styles.char, VISIBLE[char] !== undefined && styles.invisible)}>
              {VISIBLE[char] ?? char}
            </span>
            <span {...stylex.props(styles.index)}>{i}</span>
          </li>
        ))}
      </ol>
      <p {...stylex.props(shared.caption, styles.caption)}>{characters.length} characters · no structure</p>
    </div>
  );
}
