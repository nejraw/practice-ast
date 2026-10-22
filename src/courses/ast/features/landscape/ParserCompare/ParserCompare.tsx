import { useDeferredValue, useEffect, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { parsers, type Language, type OutlineRow, type ParserId, type ParserOutcome } from "@/courses/ast/engine/parsing/parsers";
import { shared } from "@/design/shared.styles";
import { CodeEditor, type Highlight } from "@/features/editor/CodeEditor";
import { Loader } from "@/design/components/Loader";
import { Button } from "@/design/components/Button";
import { Figure } from "@/features/lesson/Figure";
import { styles } from "./ParserCompare.styles";

export interface ParserCompareProps {
  presets: Array<{ label: string; language: Language; code: string }>;
}

/** One piece of code, three real parsers, three trees. */
export function ParserCompare({ presets }: ParserCompareProps) {
  const [preset, setPreset] = useState(presets[0]);
  const [code, setCode] = useState(presets[0].code);
  const [outcomes, setOutcomes] = useState<Partial<Record<ParserId, ParserOutcome>>>({});
  const [hovered, setHovered] = useState<OutlineRow | null>(null);
  const deferred = useDeferredValue(code);

  useEffect(() => {
    let current = true;
    for (const parser of parsers) {
      parser
        .run(deferred, preset.language)
        // Babel and TypeScript load on demand; after a new deploy, an open page may ask for files that are gone.
        .catch((): ParserOutcome => ({ rows: null, error: "couldn't load this parser. Reload the page to try again." }))
        .then((outcome) => {
          if (current) setOutcomes((previous) => ({ ...previous, [parser.id]: outcome }));
        });
    }
    return () => {
      current = false;
    };
  }, [deferred, preset.language]);

  const highlights: Highlight[] = hovered ? [{ start: hovered.start, end: hovered.end, tone: "focus" }] : [];

  return (
    <Figure title="Same code, three parsers">
      <div {...stylex.props(styles.row)}>
        {presets.map((option) => (
          <Button
            key={option.label}
            onClick={() => {
              setPreset(option);
              setCode(option.code);
            }}
            active={option === preset}
          >
            {option.label}
          </Button>
        ))}
      </div>
      <CodeEditor value={code} onChange={setCode} highlights={highlights} ariaLabel="Code to parse" />

      <div {...stylex.props(styles.columns)} onMouseLeave={() => setHovered(null)} onBlur={() => setHovered(null)}>
        {parsers.map((parser) => {
          const outcome = outcomes[parser.id];
          return (
            <div key={parser.id} {...stylex.props(styles.column)}>
              <span {...stylex.props(shared.caption, styles.name)}>{parser.name}</span>
              {!outcome && <Loader label="loading the parser…" small />}
              {outcome?.error && (
                <p {...stylex.props(styles.error)}>
                  {outcome.rows ? "Recovered from: " : "Stopped: "}
                  {outcome.error}
                </p>
              )}
              {outcome?.rows && (
                <ol {...stylex.props(styles.outline)}>
                  {outcome.rows.map((row, i) => (
                    <li
                      key={i}
                      // Focus and tap do what hover does, for keyboards and touch screens.
                      tabIndex={0}
                      onMouseEnter={() => setHovered(row)}
                      onFocus={() => setHovered(row)}
                      onClick={() => setHovered(row)}
                      style={{ paddingLeft: 6 + row.depth * 12 }}
                      {...stylex.props(styles.node, row === hovered && styles.nodeHovered)}
                    >
                      {row.label}
                      {row.detail && <span {...stylex.props(styles.detail)}> {row.detail}</span>}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          );
        })}
      </div>
      <p {...stylex.props(shared.caption, styles.hint)}>Hover or tap a node to see the code it covers. Edit the code to compare your own.</p>
    </Figure>
  );
}
