import { useMemo, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { astRename, classifyTextEdits, textRename } from "@/courses/ast/engine/scope/rename";
import { applyEditsTracked } from "@/courses/ast/engine/transform/edits";
import { shared } from "@/design/shared.styles";
import { CodeEditor, type Highlight } from "@/features/editor/CodeEditor";
import { useParse } from "@/courses/ast/features/tree/useParse";
import { Figure } from "@/features/lesson/Figure";
import { styles } from "./RenameComparison.styles";

export interface RenameComparisonProps {
  code: string;
  from: string;
  to: string;
}

/** Find-and-replace next to an AST-based rename, with every text mistake marked. */
export function RenameComparison({ code: initialCode, from: initialFrom, to: initialTo }: RenameComparisonProps) {
  const [code, setCode] = useState(initialCode);
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  // Both renames work on `source`, the code the tree came from (a keystroke behind the editor at most).
  const { result, source } = useParse(code);

  const comparison = useMemo(() => {
    if (!result.ok || !from || !to) return null;
    const astEdits = astRename(result.ast, from, to);
    const textEdits = classifyTextEdits(textRename(source, from, to), astEdits);
    const text = applyEditsTracked(source, textEdits);
    const ast = applyEditsTracked(source, astEdits);
    return {
      text: {
        code: text.code,
        highlights: text.placed.map<Highlight>(({ start, end, edit }) => ({
          start,
          end,
          tone: edit.correct ? "good" : "bad",
        })),
        wrong: textEdits.filter((edit) => !edit.correct).length,
        total: textEdits.length,
      },
      ast: {
        code: ast.code,
        highlights: ast.placed.map<Highlight>(({ start, end }) => ({ start, end, tone: "good" })),
        total: astEdits.length,
      },
    };
  }, [result, source, from, to]);

  return (
    <Figure title="Rename a variable, two ways">
      <div {...stylex.props(styles.controls)}>
        <label {...stylex.props(styles.field)}>
          <span {...stylex.props(shared.caption)}>Rename</span>
          <input value={from} onChange={(e) => setFrom(e.target.value)} {...stylex.props(styles.input)} />
        </label>
        <label {...stylex.props(styles.field)}>
          <span {...stylex.props(shared.caption)}>to</span>
          <input value={to} onChange={(e) => setTo(e.target.value)} {...stylex.props(styles.input)} />
        </label>
      </div>

      <CodeEditor value={code} onChange={setCode} ariaLabel="Original code" />
      {!result.ok && <p {...stylex.props(styles.note)}>Fix the syntax error to compare the two approaches.</p>}

      {comparison && (
        <div {...stylex.props(styles.columns)}>
          <div {...stylex.props(styles.column)}>
            <p {...stylex.props(styles.heading)}>
              <span {...stylex.props(shared.caption)}>(a)</span> Find and replace, whole words
            </p>
            <p {...stylex.props(styles.summary, comparison.text.wrong > 0 && styles.summaryBad)}>
              {comparison.text.total} changes, {comparison.text.wrong} wrong
            </p>
            <CodeEditor
              value={comparison.text.code}
              readOnly
              highlights={comparison.text.highlights}
              ariaLabel="Result of find and replace"
            />
          </div>
          <div {...stylex.props(styles.column)}>
            <p {...stylex.props(styles.heading)}>
              <span {...stylex.props(shared.caption)}>(b)</span> Rename using the AST
            </p>
            <p {...stylex.props(styles.summary, styles.summaryGood)}>
              {comparison.ast.total} changes, only where <code>{from}</code> is a variable
            </p>
            <CodeEditor
              value={comparison.ast.code}
              readOnly
              highlights={comparison.ast.highlights}
              ariaLabel="Result of AST rename"
            />
          </div>
        </div>
      )}
    </Figure>
  );
}
