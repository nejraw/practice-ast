import { useDeferredValue, useEffect, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { lineAndColumn } from "@/courses/ast/engine/parsing/position";
import { stripTypes, type StripOutcome } from "@/courses/ast/engine/transform/stripTypes";
import { shared } from "@/design/shared.styles";
import { CodeEditor, type Highlight } from "@/features/editor/CodeEditor";
import { Loader } from "@/design/components/Loader";
import { Button } from "@/design/components/Button";
import { Figure } from "@/features/lesson/Figure";
import { styles } from "./TypeStripper.styles";

export interface TypeStripperProps {
  presets: Array<{ label: string; code: string }>;
}

type Output = "blanked" | "removed";

/** The word (or single character) at a cursor offset, or null on whitespace. */
function wordAt(text: string, offset: number) {
  const isWord = (char: string | undefined) => !!char && /[\w$]/.test(char);
  const isBlank = (char: string | undefined) => !char || /\s/.test(char);
  // A cursor sits between two characters; prefer the one before it at the end of a word or line.
  let at = offset;
  if ((isBlank(text[at]) || (!isWord(text[at]) && isWord(text[at - 1]))) && !isBlank(text[at - 1])) at--;
  if (isBlank(text[at])) return null;
  let start = at;
  let end = at + 1;
  if (isWord(text[at])) {
    while (isWord(text[start - 1])) start--;
    while (isWord(text[end])) end++;
  }
  return { start, end };
}

/**
 * TypeScript in, JavaScript out, two ways: types replaced by spaces, as Node.js
 * does, or cut out. Click a word in either output to find it in the source.
 */
export function TypeStripper({ presets }: TypeStripperProps) {
  const [preset, setPreset] = useState(presets[0]);
  const [code, setCode] = useState(presets[0].code);
  const [outcome, setOutcome] = useState<StripOutcome | null>(null);
  const [picked, setPicked] = useState<{ output: Output; start: number; end: number } | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const deferred = useDeferredValue(code);

  useEffect(() => {
    let current = true;
    stripTypes(deferred).then(
      (result) => {
        if (current) {
          setOutcome(result);
          setPicked(null);
          setLoadFailed(false);
        }
      },
      // The parser loads on demand; after a new deploy, an open page may ask for a file that's gone.
      () => current && setLoadFailed(true),
    );
    return () => {
      current = false;
    };
  }, [deferred]);

  const pick = (output: Output, text: string) => (offset: number) => {
    const word = wordAt(text, offset);
    setPicked(word && { output, ...word });
  };

  // Where the picked word came from in the source: the same offsets, or through the map.
  let source: { start: number; end: number } | null = null;
  if (picked && outcome?.ok) {
    source =
      picked.output === "blanked"
        ? { start: picked.start, end: picked.end }
        : { start: outcome.removedToSource[picked.start], end: outcome.removedToSource[picked.end - 1] + 1 };
  }

  const sourceHighlights: Highlight[] = outcome?.ok
    ? [...outcome.ranges.map((range): Highlight => ({ ...range, tone: "focus" })), ...(source ? [{ ...source, tone: "good" as const }] : [])]
    : (outcome?.unsupported ?? []).map((range) => ({ ...range, tone: "bad" }));

  const outputs = outcome?.ok
    ? ([
        { id: "blanked", name: "types → spaces", what: "what Node.js runs: everything stays in its place", text: outcome.blanked },
        { id: "removed", name: "types cut out", what: "shorter, but everything moved", text: outcome.removed },
      ] as const)
    : [];

  const position = (text: string, offset: number) => {
    const { line, column } = lineAndColumn(text, offset);
    return `line ${line}, col ${column}`;
  };

  return (
    <Figure title="Strip the types">
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
      <CodeEditor value={code} onChange={setCode} highlights={sourceHighlights} ariaLabel="TypeScript to strip" />

      {loadFailed && <p {...stylex.props(styles.error)}>Couldn't load the parser. Reload the page to try again.</p>}
      {!outcome && !loadFailed && <Loader label="loading the parser…" small />}
      {outcome && !outcome.ok && <p {...stylex.props(styles.error)}>Refused: {outcome.message}</p>}
      {outcome?.ok && (
        <>
          <div {...stylex.props(styles.columns)}>
            {outputs.map((output) => (
              <div key={output.id} {...stylex.props(styles.column)}>
                <span {...stylex.props(shared.caption)}>
                  <span {...stylex.props(styles.name)}>{output.name}</span>: {output.what}
                </span>
                <CodeEditor
                  value={output.text}
                  readOnly
                  onCursor={pick(output.id, output.text)}
                  wrap={false}
                  highlights={picked?.output === output.id ? [{ start: picked.start, end: picked.end, tone: "good" }] : []}
                  ariaLabel={`JavaScript with ${output.name}`}
                />
              </div>
            ))}
          </div>
          <p {...stylex.props(styles.readout)}>
            {picked && source ? (
              <>
                <code>{outcome[picked.output].slice(picked.start, picked.end)}</code> is at{" "}
                {position(outcome[picked.output], picked.start)} in the output, and at {position(code, source.start)} in your
                code.{" "}
                {picked.output === "blanked" ? (
                  <span {...stylex.props(styles.good)}>Same place: no map needed.</span>
                ) : (
                  <span {...stylex.props(styles.moved)}>To point back here, a tool needs a source map.</span>
                )}
              </>
            ) : (
              "Click a word in either output to find it in your code."
            )}
          </p>
        </>
      )}
    </Figure>
  );
}
