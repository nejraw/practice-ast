import { useDeferredValue, useMemo, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { compareToSource, runTransform, transforms, unchangedLines } from "@/courses/ast/engine/transform/transform";
import { shared } from "@/design/shared.styles";
import { CodeEditor, type Highlight } from "@/features/editor/CodeEditor";
import { Button } from "@/design/components/Button";
import { Figure } from "@/features/lesson/Figure";
import { styles } from "./TransformPlayground.styles";

/** Marks every line of `output` that isn't, character for character, a line of `source`. */
function changedLines(source: string, output: string): Highlight[] {
  const unchanged = unchangedLines(source, output);
  const highlights: Highlight[] = [];
  let offset = 0;
  output.split("\n").forEach((line, i) => {
    if (line.trim() && !unchanged[i]) highlights.push({ start: offset, end: offset + line.length, tone: "focus" });
    offset += line.length + 1;
  });
  return highlights;
}

/**
 * Parse, change the tree, print it back: the same change printed two ways.
 * Recast reprints only what changed; astring prints the whole tree anew.
 */
export function TransformPlayground({ code: initialCode, initial = transforms[0].id }: { code: string; initial?: string }) {
  const [code, setCode] = useState(initialCode);
  const [transformId, setTransformId] = useState(initial);
  const deferred = useDeferredValue(code);
  const outcome = useMemo(() => runTransform(deferred, transformId), [deferred, transformId]);

  const printers = outcome.ok
    ? [
        { name: "recast", what: "reprints only the changed nodes", code: outcome.reprinted },
        { name: "astring", what: "prints the whole tree from scratch", code: outcome.regenerated },
      ]
    : [];

  return (
    <Figure title="Parse, change, print">
      <div {...stylex.props(styles.row)}>
        {transforms.map((transform) => (
          <Button key={transform.id} onClick={() => setTransformId(transform.id)} active={transform.id === transformId}>
            <code>{transform.label}</code>
          </Button>
        ))}
      </div>
      <CodeEditor value={code} onChange={setCode} ariaLabel="Code to transform" />

      {!outcome.ok ? (
        <p {...stylex.props(styles.error)}>The parser stopped: {outcome.message}</p>
      ) : (
        <>
          <div {...stylex.props(styles.changes)}>
            <span {...stylex.props(shared.caption)}>what changed in the tree</span>
            {outcome.changes.length === 0 ? (
              <p {...stylex.props(styles.none)}>Nothing matched, so nothing changed.</p>
            ) : (
              <ul {...stylex.props(styles.list)}>
                {/* Two changes on one line read the same, so the text can't be the key. */}
                {outcome.changes.map((change, i) => (
                  <li key={i}>{change}</li>
                ))}
              </ul>
            )}
          </div>

          <div {...stylex.props(styles.columns)}>
            {printers.map((printer) => {
              const stats = compareToSource(deferred, printer.code);
              return (
                <div key={printer.name} {...stylex.props(styles.column)}>
                  <span {...stylex.props(shared.caption)}>
                    printed by <span {...stylex.props(styles.printer)}>{printer.name}</span>: {printer.what}
                  </span>
                  <CodeEditor value={printer.code} readOnly compact highlights={changedLines(deferred, printer.code)} ariaLabel={`Printed by ${printer.name}`} />
                  <p {...stylex.props(styles.stats)}>
                    <span {...stylex.props(stats.comments < stats.sourceComments && styles.lost)}>
                      {stats.comments} of {stats.sourceComments} comments
                    </span>
                    {" · "}
                    {stats.unchangedLines} of {stats.lines} lines exactly as you wrote them
                  </p>
                </div>
              );
            })}
          </div>
          <p {...stylex.props(shared.caption, styles.hint)}>Highlighted lines differ from your code. Edit the code to try your own.</p>
        </>
      )}
    </Figure>
  );
}
