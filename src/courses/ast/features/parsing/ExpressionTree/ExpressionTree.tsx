import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { unwrapExpression, type Positioned } from "@/courses/ast/engine/parsing/parse";
import { TreeDiagram } from "@/courses/ast/features/tree/TreeDiagram";
import { CodeEditor } from "@/features/editor/CodeEditor";
import { useParse } from "@/courses/ast/features/tree/useParse";
import { OpenInExplorer } from "@/courses/ast/features/explorer/OpenInExplorer";
import { Figure } from "@/features/lesson/Figure";
import { styles } from "./ExpressionTree.styles";

/** Edit a small piece of code and watch its tree change. Hover a box to see its source. */
export function ExpressionTree({ code: initialCode, title = "Edit the code" }: { code: string; title?: string }) {
  const [code, setCode] = useState(initialCode);
  const [hovered, setHovered] = useState<Positioned | null>(null);
  const { result, lastGood, stale } = useParse(code);
  const program = result.ok ? result.ast : lastGood;

  return (
    <Figure title={title} actions={<OpenInExplorer code={code} />}>
      <CodeEditor
        value={code}
        onChange={setCode}
        compact
        ariaLabel="Code for the tree diagram"
        highlights={
          !result.ok
            ? [{ start: result.pos, end: result.pos, tone: "error" }]
            : hovered
              ? [{ start: hovered.start, end: hovered.end, tone: "focus" }]
              : []
        }
      />
      {!result.ok && <p {...stylex.props(styles.error)}>{result.message}</p>}
      {program && (
        <div {...stylex.props(stale && styles.stale)}>
          <TreeDiagram root={unwrapExpression(program)} highlighted={hovered} onHover={setHovered} />
        </div>
      )}
    </Figure>
  );
}
