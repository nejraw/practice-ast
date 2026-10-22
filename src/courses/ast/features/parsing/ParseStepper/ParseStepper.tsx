import { useDeferredValue, useMemo, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { describeNode, grammar, miniParse } from "@/courses/ast/engine/parsing/miniParser";
import { shared } from "@/design/shared.styles";
import { TreeDiagram } from "@/courses/ast/features/tree/TreeDiagram";
import { CodeEditor, type Highlight } from "@/features/editor/CodeEditor";
import { Button } from "@/design/components/Button";
import { Figure } from "@/features/lesson/Figure";
import { styles } from "./ParseStepper.styles";

export interface ParseStepperProps {
  code: string;
  presets?: string[];
}

/**
 * Watch a recursive descent parser work: the grammar rule it's in, its call
 * stack, the tokens it has read, and the pieces of tree it has built so far.
 */
export function ParseStepper({ code: initialCode, presets }: ParseStepperProps) {
  const [code, setCode] = useState(initialCode);
  // Index of the step being shown; -1 before the first step.
  const [current, setCurrent] = useState(-1);
  const deferred = useDeferredValue(code);
  const parse = useMemo(() => miniParse(deferred), [deferred]);
  const { tokens, steps } = parse;

  const step = current >= 0 ? steps[Math.min(current, steps.length - 1)] : undefined;
  const cursor = step?.cursor ?? 0;
  const activeRule = step?.stack.at(-1)?.rule;
  const finished = current >= steps.length - 1;

  const highlights: Highlight[] = step?.kind === "error"
    ? [{ start: tokens[cursor]?.start ?? deferred.length, end: tokens[cursor]?.end ?? deferred.length, tone: "error" }]
    : step?.token
      ? [{ start: step.token.start, end: step.token.end, tone: "focus" }]
      : step?.node
        ? [{ start: step.node.start, end: step.node.end, tone: "focus" }]
        : [];

  const change = (next: string) => {
    setCode(next);
    setCurrent(-1);
  };

  return (
    <Figure title="Parse it, one step at a time">
      {presets && (
        <div {...stylex.props(styles.row)}>
          {presets.map((preset) => (
            <Button key={preset} onClick={() => change(preset)} active={preset === code}>
              <code>{preset}</code>
            </Button>
          ))}
        </div>
      )}
      <CodeEditor value={code} onChange={change} compact highlights={highlights} ariaLabel="Expression to parse" />

      <div {...stylex.props(styles.row)} aria-label="Tokens">
        {tokens.map((token, i) => (
          <span
            key={`${token.start}-${token.end}`}
            {...stylex.props(
              styles.token,
              i < cursor && styles.tokenRead,
              i === cursor && current >= 0 && styles.tokenNext,
              step?.token === token && styles.tokenJustRead,
            )}
          >
            {token.text}
          </span>
        ))}
        {tokens.length > 0 && (
          <span {...stylex.props(shared.caption, styles.tokenLegend)}>
            {current < 0 ? "tokens" : `${cursor} of ${tokens.length} read`}
          </span>
        )}
      </div>

      <div {...stylex.props(styles.columns)}>
        <div {...stylex.props(styles.column)}>
          <span {...stylex.props(shared.caption)}>the grammar</span>
          <ol {...stylex.props(styles.grammar)}>
            {grammar.map((line) => (
              <li key={line.rule} {...stylex.props(styles.grammarLine, line.rule === activeRule && styles.grammarActive)}>
                {line.text}
              </li>
            ))}
          </ol>

          <span {...stylex.props(shared.caption)}>the call stack</span>
          <ol {...stylex.props(styles.stack)}>
            {(step?.stack ?? []).map((frame, depth) => (
              <li
                key={depth}
                style={{ paddingLeft: depth * 14 }}
                {...stylex.props(styles.frame, depth === step!.stack.length - 1 && styles.frameTop)}
              >
                <span>{frame.rule}()</span>
                {frame.left && (
                  <span {...stylex.props(styles.holds)}>
                    holds {describeNode(frame.left)}
                    {frame.operator && ` ${frame.operator} …`}
                  </span>
                )}
              </li>
            ))}
            {(!step || step.stack.length === 0) && (
              <li {...stylex.props(styles.frame, styles.empty)}>{step ? "empty: all calls returned" : "empty"}</li>
            )}
          </ol>
        </div>

        <div {...stylex.props(styles.column, styles.treeColumn)}>
          <span {...stylex.props(shared.caption)}>built so far</span>
          <div {...stylex.props(styles.pieces)}>
            {(step?.pieces ?? []).map((piece) => (
              <TreeDiagram key={`${piece.start}-${piece.end}-${piece.type}`} root={piece} highlighted={step?.node ?? null} bare />
            ))}
            {(step?.pieces.length ?? 0) === 0 && <p {...stylex.props(styles.empty)}>nothing yet</p>}
          </div>
        </div>
      </div>

      <p {...stylex.props(styles.message, step?.kind === "error" && styles.messageError)} aria-live="polite">
        {step ? step.message : "Press Step to start parsing."}
      </p>

      <div {...stylex.props(styles.controls)}>
        <Button primary disabled={finished} onClick={() => setCurrent((i) => i + 1)}>
          Step ▸
        </Button>
        <Button disabled={finished} onClick={() => setCurrent(steps.length - 1)}>
          Run all
        </Button>
        <Button disabled={current < 0} onClick={() => setCurrent(-1)}>
          Reset
        </Button>
        <span {...stylex.props(styles.status)}>
          step {Math.max(0, Math.min(current + 1, steps.length))} of {steps.length}
        </span>
      </div>
    </Figure>
  );
}
