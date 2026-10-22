import { useMemo, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { compile, describeInstruction, execute, variablesOf, type Value } from "@/courses/ast/engine/runtime/machine";
import { unwrapExpression, type Positioned } from "@/courses/ast/engine/parsing/parse";
import { shared } from "@/design/shared.styles";
import { TreeDiagram } from "@/courses/ast/features/tree/TreeDiagram";
import { CodeEditor, type Highlight } from "@/features/editor/CodeEditor";
import { useParse } from "@/courses/ast/features/tree/useParse";
import { Button } from "@/design/components/Button";
import { Figure } from "@/features/lesson/Figure";
import { styles } from "./RunTheTree.styles";

export interface RunTheTreeProps {
  code: string;
  values: Record<string, Value>;
}

function format(value: Value) {
  return typeof value === "string" ? JSON.stringify(value) : String(value);
}

function parseInput(text: string): Value {
  const number = Number(text);
  return text.trim() !== "" && !Number.isNaN(number) ? number : text;
}

/**
 * Turns a tree into a list of steps and runs them one at a time: the most
 * basic version of what an engine does with your code.
 */
export function RunTheTree({ code: initialCode, values: initialValues }: RunTheTreeProps) {
  const [code, setCode] = useState(initialCode);
  const [inputs, setInputs] = useState<Record<string, string>>(() =>
    Object.fromEntries(Object.entries(initialValues).map(([name, value]) => [name, String(value)])),
  );
  // -1: nothing has run yet. Otherwise the index of the last step that ran.
  const [current, setCurrent] = useState(-1);
  const { result } = useParse(code);

  const tree = result.ok ? unwrapExpression(result.ast) : null;
  const compiled = useMemo(() => (tree ? compile(tree) : null), [tree]);
  const program = useMemo(() => (compiled?.ok ? compiled.program : []), [compiled]);
  const names = useMemo(() => variablesOf(program), [program]);

  const run = useMemo(() => {
    const variables = Object.fromEntries(names.map((name) => [name, parseInput(inputs[name] ?? "")]));
    return execute(program, variables);
  }, [program, names, inputs]);

  const ran = run.trace.slice(0, current + 1);
  const step = ran.at(-1);
  const badges = new Map<Positioned, string>(ran.map((s) => [s.instruction.node, format(s.value)]));
  const finished = run.ok && current === program.length - 1 && program.length > 0;

  const highlights: Highlight[] = !result.ok
    ? [{ start: result.pos, end: result.pos, tone: "error" }]
    : compiled && !compiled.ok
      ? [{ start: compiled.node.start, end: compiled.node.end, tone: "error" }]
      : step
        ? [{ start: step.instruction.node.start, end: step.instruction.node.end, tone: "focus" }]
        : [];

  const restart = () => setCurrent(-1);

  return (
    <Figure title="Run the tree, one step at a time">
      <CodeEditor
        value={code}
        onChange={(next) => {
          setCode(next);
          restart();
        }}
        compact
        highlights={highlights}
        ariaLabel="Expression to run"
      />

      {names.length > 0 && (
        <div {...stylex.props(styles.variables)}>
          <span {...stylex.props(shared.caption)}>where</span>
          {names.map((name) => (
            <label key={name} {...stylex.props(styles.variable)}>
              <span {...stylex.props(styles.name)}>{name}</span> =
              <input
                value={inputs[name] ?? ""}
                onChange={(event) => {
                  setInputs((all) => ({ ...all, [name]: event.target.value }));
                  restart();
                }}
                {...stylex.props(styles.input)}
              />
            </label>
          ))}
        </div>
      )}

      {!result.ok && <p {...stylex.props(styles.problem)}>{result.message}</p>}
      {compiled && !compiled.ok && <p {...stylex.props(styles.problem)}>Sorry, {compiled.message}.</p>}

      {tree && compiled?.ok && (
        <>
          <div {...stylex.props(styles.columns)}>
            <div {...stylex.props(styles.column)}>
              <span {...stylex.props(shared.caption)}>the tree</span>
              <TreeDiagram root={tree} badges={badges} highlighted={step?.instruction.node ?? null} bare />
            </div>
            <div {...stylex.props(styles.column, styles.stepsColumn)}>
              <span {...stylex.props(shared.caption)}>the steps, children first</span>
              <ol {...stylex.props(styles.steps)}>
                {program.map((instruction, i) => {
                  const done = i <= current ? run.trace[i] : undefined;
                  return (
                    <li key={i} {...stylex.props(styles.step, i === current && styles.stepCurrent, i > current && styles.stepPending)}>
                      <span {...stylex.props(styles.stepNumber)}>{String(i + 1).padStart(2, "0")}</span>
                      <span {...stylex.props(styles.instruction)}>{describeInstruction(instruction)}</span>
                      <span {...stylex.props(styles.result)}>{done ? `= ${format(done.value)}` : ""}</span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>

          <div {...stylex.props(styles.controls)}>
            <Button primary disabled={finished || (!run.ok && current >= run.trace.length - 1)} onClick={() => setCurrent((i) => i + 1)}>
              Step ▸
            </Button>
            <Button disabled={finished} onClick={() => setCurrent(run.trace.length - 1)}>
              Run all
            </Button>
            <Button disabled={current < 0} onClick={restart}>
              Reset
            </Button>
            <span {...stylex.props(styles.status)}>
              {finished
                ? `result: ${format(run.trace.at(-1)!.value)}`
                : !run.ok && current >= run.trace.length - 1
                  ? `error: ${run.message}`
                  : `step ${current + 1} of ${program.length}`}
            </span>
          </div>
        </>
      )}
    </Figure>
  );
}
