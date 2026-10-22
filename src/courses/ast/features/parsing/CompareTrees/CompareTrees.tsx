import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { unwrapExpression } from "@/courses/ast/engine/parsing/parse";
import { sameTree } from "@/courses/ast/engine/tree/walk";
import { shared } from "@/design/shared.styles";
import { TreeDiagram } from "@/courses/ast/features/tree/TreeDiagram";
import { CodeEditor } from "@/features/editor/CodeEditor";
import { useParse } from "@/courses/ast/features/tree/useParse";
import { Button } from "@/design/components/Button";
import { Figure } from "@/features/lesson/Figure";
import { TreeVerdict } from "@/courses/ast/features/parsing/TreeVerdict";
import { styles } from "./CompareTrees.styles";

export interface CompareTreesProps {
  left: string;
  /** Suggestions for the right-hand side, shown as buttons. */
  variants: string[];
}

/** Two pieces of code side by side, and whether they produce the same tree. */
export function CompareTrees({ left: initialLeft, variants }: CompareTreesProps) {
  const [left, setLeft] = useState(initialLeft);
  const [right, setRight] = useState(variants[0]);
  const a = useParse(left);
  const b = useParse(right);
  const leftTree = a.result.ok ? unwrapExpression(a.result.ast) : null;
  const rightTree = b.result.ok ? unwrapExpression(b.result.ast) : null;

  return (
    <Figure title="Same tree or not?">
      <div {...stylex.props(styles.variants)}>
        <span {...stylex.props(shared.caption)}>Compare with</span>
        {variants.map((variant) => (
          <Button key={variant} onClick={() => setRight(variant)} active={variant === right}>
            {variant}
          </Button>
        ))}
      </div>

      <div {...stylex.props(styles.columns)}>
        <div {...stylex.props(styles.column)}>
          <span {...stylex.props(shared.caption)}>A</span>
          <CodeEditor value={left} onChange={setLeft} compact ariaLabel="Code A" />
          {leftTree ? <TreeDiagram root={leftTree} bare /> : <p {...stylex.props(shared.caption)}>Syntax error</p>}
        </div>
        <div {...stylex.props(styles.column, styles.secondColumn)}>
          <span {...stylex.props(shared.caption)}>B</span>
          <CodeEditor value={right} onChange={setRight} compact ariaLabel="Code B" />
          {rightTree ? <TreeDiagram root={rightTree} bare /> : <p {...stylex.props(shared.caption)}>Syntax error</p>}
        </div>
      </div>

      {leftTree && rightTree && <TreeVerdict same={sameTree(leftTree, rightTree)} />}
    </Figure>
  );
}
