import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { mapSpan } from "@/courses/ast/engine/parsing/position";
import { applyFixes, type Report } from "@/courses/ast/engine/transform/ruleRunner";
import { shared } from "@/design/shared.styles";
import { CodeEditor, type Highlight } from "@/features/editor/CodeEditor";
import { Button } from "@/design/components/Button";
import { Figure } from "@/features/lesson/Figure";
import { styles } from "./RuleLab.styles";
import { useRuleRunner } from "./useRuleRunner";

export interface RuleLabProps {
  presets: Array<{ label: string; rule: string }>;
  code: string;
}

/** Write a lint rule on the left, see it run on the code on the right. */
export function RuleLab({ presets, code: initialCode }: RuleLabProps) {
  const [rule, setRule] = useState(presets[0].rule);
  const [code, setCode] = useState(initialCode);
  const [hovered, setHovered] = useState<Report | null>(null);
  // The rule runs in a worker, so the outcome arrives a moment after each change.
  const ran = useRuleRunner(rule, code);
  const outcome = ran?.outcome;

  const reports = outcome?.ok ? outcome.reports : [];
  // Fixes are offsets into the code the rule ran on; only apply them to that same code.
  const fixable = ran?.code === code && reports.some((report) => report.fix);
  // Until the new outcome arrives, the reports are placed in the code they were made for.
  const highlights: Highlight[] = reports.flatMap((report) => {
    const span = ran && mapSpan(ran.code, code, report);
    return span ? [{ start: span.start, end: span.end, tone: report === hovered ? "focus" : "bad" }] : [];
  });

  return (
    <Figure title="Write a lint rule">
      <div {...stylex.props(styles.row)}>
        {presets.map((preset) => (
          <Button key={preset.label} onClick={() => setRule(preset.rule)} active={preset.rule === rule}>
            <code>{preset.label}</code>
          </Button>
        ))}
        <Button onClick={() => setCode(initialCode)} disabled={code === initialCode}>
          Reset code
        </Button>
      </div>

      <div {...stylex.props(styles.columns)}>
        <div {...stylex.props(styles.column)}>
          <span {...stylex.props(shared.caption)}>the rule</span>
          <CodeEditor value={rule} onChange={setRule} ariaLabel="Lint rule" />
        </div>
        <div {...stylex.props(styles.column)}>
          <span {...stylex.props(shared.caption)}>the code it checks</span>
          <CodeEditor value={code} onChange={setCode} highlights={highlights} ariaLabel="Code to lint" />
        </div>
      </div>

      {!outcome ? null : !outcome.ok ? (
        <p {...stylex.props(styles.problem)}>
          {outcome.where === "rule" ? "The rule failed: " : "The code doesn't parse: "}
          {outcome.message}
        </p>
      ) : (
        <div {...stylex.props(styles.results)}>
          <span {...stylex.props(shared.caption)}>
            {reports.length === 0 ? "no problems" : `${reports.length} ${reports.length === 1 ? "problem" : "problems"}`}
          </span>
          {reports.length > 0 && (
            <ol {...stylex.props(styles.reports)} onMouseLeave={() => setHovered(null)} onBlur={() => setHovered(null)}>
              {reports.map((report, i) => (
                <li
                  key={i}
                  tabIndex={0}
                  onMouseEnter={() => setHovered(report)}
                  onFocus={() => setHovered(report)}
                  onClick={() => setHovered(report)}
                  {...stylex.props(styles.report, report === hovered && styles.reportHovered)}
                >
                  <span {...stylex.props(styles.line)}>line {report.line}</span>
                  <span>{report.message}</span>
                  {report.fix && <span {...stylex.props(styles.fixMark)}>fixable</span>}
                </li>
              ))}
            </ol>
          )}
          {fixable && (
            <div>
              <Button primary onClick={() => setCode(applyFixes(code, reports))}>
                Apply fixes
              </Button>
            </div>
          )}
        </div>
      )}
      <p {...stylex.props(shared.caption, styles.hint)}>
        Both sides are editable. The rule runs in your browser, on every change.
      </p>
    </Figure>
  );
}
