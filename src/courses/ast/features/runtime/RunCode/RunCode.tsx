import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { shared } from "@/design/shared.styles";
import { CodeEditor } from "@/features/editor/CodeEditor";
import { Button } from "@/design/components/Button";
import { Figure } from "@/features/lesson/Figure";
import { styles } from "./RunCode.styles";

interface RunResult {
  logs: string[];
  error?: { phase: "parse" | "run"; message: string };
}

function format(value: unknown) {
  return typeof value === "string" ? value : JSON.stringify(value) ?? String(value);
}

/**
 * Runs the learner's code with the browser's own engine. `new Function` parses
 * the whole body first, so a syntax error anywhere means nothing runs at all,
 * which is exactly the point of this demo.
 */
function run(code: string): RunResult {
  const logs: string[] = [];
  const print = (...args: unknown[]) => void logs.push(args.map(format).join(" "));
  // Learners reach for warn and error too; a missing method would look like a bug in their code.
  const fakeConsole = { log: print, info: print, warn: print, error: print, debug: print };

  let compiled: (console: typeof fakeConsole) => void;
  try {
    compiled = new Function("console", code) as typeof compiled;
  } catch (error) {
    return { logs, error: { phase: "parse", message: String(error) } };
  }
  try {
    compiled(fakeConsole);
  } catch (error) {
    return { logs, error: { phase: "run", message: String(error) } };
  }
  return { logs };
}

export interface RunCodeProps {
  examples: { name: string; code: string }[];
}

export function RunCode({ examples }: RunCodeProps) {
  const [code, setCode] = useState(examples[0].code);
  const [result, setResult] = useState<RunResult | null>(null);

  return (
    <Figure title="Run it in your browser's engine">
      <div {...stylex.props(styles.row)}>
        {examples.map((example) => (
          <Button
            key={example.name}
            active={code === example.code}
            onClick={() => {
              setCode(example.code);
              setResult(null);
            }}
          >
            {example.name}
          </Button>
        ))}
        <span {...stylex.props(styles.spacer)} />
        <Button primary onClick={() => setResult(run(code))}>
          Run ▸
        </Button>
      </div>

      <CodeEditor
        value={code}
        onChange={(next) => {
          setCode(next);
          setResult(null);
        }}
        ariaLabel="Code to run"
      />

      <div aria-live="polite" {...stylex.props(styles.output)}>
        <span {...stylex.props(shared.caption)}>Output</span>
        {!result && <div {...stylex.props(styles.muted)}>Press Run to execute the code.</div>}
        {result && result.logs.length === 0 && <div {...stylex.props(styles.muted)}>(nothing was printed)</div>}
        {result?.logs.map((line, i) => (
          <div key={i} {...stylex.props(styles.log)}>
            {line}
          </div>
        ))}
        {result?.error && <div {...stylex.props(styles.errorLine)}>{result.error.message}</div>}
      </div>

      {result?.error && (
        <p {...stylex.props(styles.explain)}>
          {result.error.phase === "parse"
            ? "The engine failed while parsing. It never got to run a single line, not even the ones before the error."
            : `The code parsed fine and started running: ${
                result.logs.length === 1 ? "1 line was" : `${result.logs.length} lines were`
              } printed before the error happened at runtime.`}
        </p>
      )}
    </Figure>
  );
}
