import { useMemo, useRef, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { lineAt, mapOffset, mapSpan } from "@/courses/ast/engine/parsing/position";
import { astRename } from "@/courses/ast/engine/scope/rename";
import { analyzeScopes, bindingAt, renameBinding, renameConflict } from "@/courses/ast/engine/scope/scope";
import { applyEditsTracked } from "@/courses/ast/engine/transform/edits";
import { shared } from "@/design/shared.styles";
import { CodeEditor, type Highlight } from "@/features/editor/CodeEditor";
import { useParse } from "@/courses/ast/features/tree/useParse";
import { Figure } from "@/features/lesson/Figure";
import { styles } from "./ScopeRename.styles";

/**
 * Lesson 2's AST rename (every variable with that name) next to a
 * scope-aware rename (only the variable you picked).
 */
export function ScopeRename({ code: initialCode, at, to: initialTo }: { code: string; at: number; to: string }) {
  const [code, setCode] = useState(initialCode);
  // The variable you picked, as a place in the code: an offset and the version of the code it's in,
  // so it can be followed through edits elsewhere. Clicking or typing away from a name keeps it.
  const [picked, setPicked] = useState({ offset: at, code: initialCode });
  const [to, setTo] = useState(initialTo);
  // While the code doesn't parse, this is the last version that did; every offset below is into `source`.
  const { lastGood, lastGoodSource: source, stale } = useParse(code);
  const analysis = useMemo(() => (lastGood ? analyzeScopes(lastGood) : null), [lastGood]);
  // The editor reports a change before the cursor move that comes with it, so this is always the newest code.
  const editorCode = useRef(code);

  const pick = (offset: number) => {
    const at = source === null ? null : mapOffset(editorCode.current, source, offset);
    if (analysis && at !== null && bindingAt(analysis, at)) setPicked({ offset, code: editorCode.current });
  };

  const outcome = useMemo(() => {
    if (!lastGood || !analysis || source === null || !to) return null;
    const at = mapOffset(picked.code, source, picked.offset);
    const binding = at === null ? undefined : bindingAt(analysis, at);
    if (!binding) return null;
    const conflict = renameConflict(analysis, binding, to, source);
    const scoped = renameBinding(lastGood, binding, to);
    const byName = astRename(lastGood, binding.name, to);
    const right = new Set(scoped.map((edit) => edit.start));
    const nameResult = applyEditsTracked(source, byName);
    const scopedResult = applyEditsTracked(source, scoped);
    return {
      binding,
      conflict,
      line: lineAt(source, binding.declaration.start),
      byName: {
        code: nameResult.code,
        wrong: byName.filter((edit) => !right.has(edit.start)).length,
        highlights: nameResult.placed.map<Highlight>(({ start, end, edit }) => ({
          start,
          end,
          tone: right.has(edit.start) ? "good" : "bad",
        })),
      },
      scoped: {
        code: scopedResult.code,
        highlights: scopedResult.placed.map<Highlight>(({ start, end }) => ({ start, end, tone: "good" })),
      },
      // Marked in the editor, which may hold a newer version than `source`.
      selection: binding.occurrences.flatMap<Highlight>((o) => {
        const span = mapSpan(source, code, o);
        return span ? [{ start: span.start, end: span.end, tone: "focus" }] : [];
      }),
    };
  }, [lastGood, analysis, source, code, picked, to]);

  return (
    <Figure title="Rename one variable, not one name">
      <CodeEditor
        value={code}
        onChange={(next) => {
          editorCode.current = next;
          setCode(next);
        }}
        onCursor={pick}
        highlights={outcome?.selection ?? []}
        ariaLabel="Code to rename in"
      />
      <p {...stylex.props(styles.controls)}>
        <span>
          Rename{" "}
          <code {...stylex.props(styles.name)}>{outcome?.binding.name ?? "…"}</code>
          {outcome && <span {...stylex.props(styles.muted)}> (the one declared on line {outcome.line})</span>}{" "}
          to
        </span>
        <input value={to} onChange={(event) => setTo(event.target.value)} aria-label="New name" {...stylex.props(styles.input)} />
        <span {...stylex.props(styles.muted)}>Click a name in the code to pick another variable.</span>
      </p>
      {stale && <p {...stylex.props(styles.verdict)}>The code doesn't parse; this is the last version that did.</p>}

      {outcome && (
        <div {...stylex.props(styles.columns)}>
          <div {...stylex.props(styles.column)}>
            <span {...stylex.props(shared.caption)}>by name, as in lesson 2</span>
            <CodeEditor value={outcome.byName.code} readOnly compact highlights={outcome.byName.highlights} ariaLabel="Renamed by name" />
            <p {...stylex.props(styles.verdict, outcome.byName.wrong > 0 ? styles.bad : styles.good)}>
              {outcome.byName.wrong > 0
                ? `${outcome.byName.wrong} ${outcome.byName.wrong === 1 ? "name" : "names"} of a different variable changed too.`
                : "Correct here: no other variable has this name."}
            </p>
          </div>
          <div {...stylex.props(styles.column)}>
            <span {...stylex.props(shared.caption)}>by binding, with scope analysis</span>
            {outcome.conflict ? (
              // What an editor's "rename symbol" does too: refuse rather than change what the code means.
              <p {...stylex.props(styles.verdict, styles.bad)}>Refused. {outcome.conflict}</p>
            ) : (
              <>
                <CodeEditor value={outcome.scoped.code} readOnly compact highlights={outcome.scoped.highlights} ariaLabel="Renamed by binding" />
                <p {...stylex.props(styles.verdict, styles.good)}>Only the variable you picked.</p>
              </>
            )}
          </div>
        </div>
      )}
    </Figure>
  );
}
