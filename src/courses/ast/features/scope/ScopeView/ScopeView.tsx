import { useMemo, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { lineAt, mapOffset, mapSpan } from "@/courses/ast/engine/parsing/position";
import { analyzeScopes, bindingAt, type Binding, type ScopeInfo } from "@/courses/ast/engine/scope/scope";
import { shared } from "@/design/shared.styles";
import { CodeEditor, type Highlight } from "@/features/editor/CodeEditor";
import { useParse } from "@/courses/ast/features/tree/useParse";
import { Button } from "@/design/components/Button";
import { Figure } from "@/features/lesson/Figure";
import { styles } from "./ScopeView.styles";

export interface ScopeViewProps {
  presets: Array<{ label: string; code: string }>;
  title?: string;
}

function scopeLabel(scope: ScopeInfo) {
  if (scope.type === "module") return "the file";
  if (scope.type === "function") return scope.node.name ? `function ${scope.node.name}` : "a function";
  if (scope.type === "class") return `class ${scope.node.name ?? ""}`.trim();
  if (scope.type === "for") return "a for loop";
  return `a ${scope.type} block`;
}

/** Click a name to see which declaration it belongs to and every place it's used. */
export function ScopeView({ presets, title = "Which variable is which?" }: ScopeViewProps) {
  const [code, setCode] = useState(presets[0].code);
  const [selected, setSelected] = useState<{ name: string; declaration: number } | null>(null);
  // `source` is the code the analysis came from: older than the editor's while the code doesn't parse.
  const { result, lastGood, lastGoodSource: source } = useParse(code);
  const analysis = useMemo(() => (lastGood ? analyzeScopes(lastGood) : null), [lastGood]);

  // Selection survives re-analysis by matching on name and declaration position.
  const binding =
    selected && analysis?.bindings.find((b) => b.name === selected.name && b.declaration.start === selected.declaration);
  const select = (next: Binding | undefined) =>
    setSelected(next ? { name: next.name, declaration: next.declaration.start } : null);

  const highlights: Highlight[] = !result.ok
    ? [{ start: result.pos, end: result.pos, tone: "error" }]
    : (binding?.occurrences.flatMap((o) => {
        const span = source === null ? null : mapSpan(source, code, o);
        return span ? [{ start: span.start, end: span.end, tone: o.declaration ? ("good" as const) : ("focus" as const) }] : [];
      }) ?? []);
  const pickAt = (offset: number) => {
    const at = source === null ? null : mapOffset(code, source, offset);
    if (analysis && at !== null) select(bindingAt(analysis, at));
  };

  return (
    <Figure title={title}>
      <div {...stylex.props(styles.row)}>
        {presets.map((preset) => (
          <Button
            key={preset.label}
            onClick={() => {
              setCode(preset.code);
              setSelected(null);
            }}
            active={preset.code === code}
          >
            {preset.label}
          </Button>
        ))}
      </div>
      <CodeEditor
        value={code}
        onChange={setCode}
        onCursor={pickAt}
        highlights={highlights}
        ariaLabel="Code to analyze"
      />

      <p {...stylex.props(styles.info, !binding && styles.infoIdle)} aria-live="polite">
        {binding ? (
          <>
            <code {...stylex.props(styles.name)}>{binding.name}</code> is a <strong>{binding.kind}</strong> declared in{" "}
            {scopeLabel(binding.scope)} on line {lineAt(source ?? code, binding.declaration.start)}, used{" "}
            {binding.occurrences.length - 1} {binding.occurrences.length === 2 ? "time" : "times"}.
            {binding.captured && (
              <span {...stylex.props(styles.captured)}>
                {" "}
                An inner function uses it, so it has to outlive the call that created it.
              </span>
            )}
          </>
        ) : (
          "Click a variable name in the code, or a name below."
        )}
      </p>

      {analysis && (
        <ol {...stylex.props(styles.scopes)}>
          {analysis.scopes.map((scope) => (
            <li key={scope.id} style={{ marginLeft: scope.depth * 22 }} {...stylex.props(styles.scope)}>
              <span {...stylex.props(shared.caption, styles.scopeLabel)}>{scopeLabel(scope)}</span>
              <span {...stylex.props(styles.chips)}>
                {scope.bindings.length === 0 && <span {...stylex.props(styles.none)}>no variables</span>}
                {scope.bindings.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => select(b)}
                    aria-pressed={b === binding}
                    {...stylex.props(styles.chip, b === binding && styles.chipActive)}
                  >
                    {b.name}
                    <span {...stylex.props(styles.kind)}>{b.kind}</span>
                    {b.captured && <span {...stylex.props(styles.capturedMark)} title="captured by an inner function">↗</span>}
                  </button>
                ))}
              </span>
            </li>
          ))}
          {analysis.globals.length > 0 && (
            <li {...stylex.props(styles.scope)}>
              <span {...stylex.props(shared.caption, styles.scopeLabel)}>not declared here</span>
              <span {...stylex.props(styles.chips)}>
                {analysis.globals.map((global) => (
                  <span key={global.name} {...stylex.props(styles.chip, styles.globalChip)}>
                    {global.name}
                  </span>
                ))}
              </span>
            </li>
          )}
        </ol>
      )}
    </Figure>
  );
}
