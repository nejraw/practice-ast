import { useMemo, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import type * as ESTree from "estree";
import { parseProgram, type Positioned } from "@/courses/ast/engine/parsing/parse";
import { walk } from "@/courses/ast/engine/tree/walk";
import { bytecodeExamples, NODE_VERSION, type BytecodeExampleName, type BytecodeLine } from "@/courses/ast/content/bytecode";
import { shared } from "@/design/shared.styles";
import { TreeDiagram } from "@/courses/ast/features/tree/TreeDiagram";
import { CodeEditor, type Highlight } from "@/features/editor/CodeEditor";
import { Figure } from "@/features/lesson/Figure";
import { styles } from "./BytecodeView.styles";

/**
 * Real V8 bytecode next to the tree it was generated from. Hover an
 * instruction to see its node, or a node to see its instructions.
 */
export function BytecodeView({ example, title }: { example: BytecodeExampleName; title: string }) {
  const { code, registers, lines } = bytecodeExamples[example];
  const [hoveredLine, setHoveredLine] = useState<BytecodeLine | null>(null);
  const [hoveredNode, setHoveredNode] = useState<Positioned | null>(null);

  // The tree of the function's body: its parameters are listed as registers instead.
  const { body, byRange } = useMemo(() => {
    const result = parseProgram(code);
    if (!result.ok) throw new Error(`Bytecode example doesn't parse: ${result.message}`);
    const fn = result.ast.body[0] as Positioned<ESTree.FunctionDeclaration>;
    const nodes = new Map<string, Positioned>();
    walk(result.ast, (node) => void nodes.set(`${node.start}-${node.end}`, node));
    return { body: fn.body as Positioned, byRange: nodes };
  }, [code]);

  const nodeOf = (line: BytecodeLine) => byRange.get(line.range.join("-")) ?? null;
  const activeNode = hoveredLine ? nodeOf(hoveredLine) : hoveredNode;
  const isActive = (line: BytecodeLine) =>
    hoveredLine
      ? line === hoveredLine
      : hoveredNode !== null && line.range[0] >= hoveredNode.start && line.range[1] <= hoveredNode.end;
  const jumpTarget = hoveredLine?.jumpTo;
  const showLine = (line: BytecodeLine) => {
    setHoveredNode(null);
    setHoveredLine(line);
  };

  const highlights: Highlight[] = activeNode ? [{ start: activeNode.start, end: activeNode.end, tone: "focus" }] : [];

  return (
    <Figure title={title}>
      <CodeEditor value={code} readOnly compact highlights={highlights} ariaLabel="Source code" />

      <p {...stylex.props(styles.registers)}>
        <span {...stylex.props(shared.caption)}>registers</span>
        {registers.map(([register, meaning]) => (
          <span key={register}>
            <code {...stylex.props(styles.register)}>{register}</code> {meaning}
          </span>
        ))}
        <span>
          <code {...stylex.props(styles.register)}>acc</code> the accumulator: the value being worked on
        </span>
      </p>

      <div
        {...stylex.props(styles.columns)}
        onMouseLeave={() => (setHoveredLine(null), setHoveredNode(null))}
        onBlur={() => (setHoveredLine(null), setHoveredNode(null))}
      >
        <div {...stylex.props(styles.column)}>
          <span {...stylex.props(shared.caption)}>the tree (function body)</span>
          <TreeDiagram root={body} highlighted={activeNode} onHover={setHoveredNode} bare />
        </div>
        <div {...stylex.props(styles.column, styles.codeColumn)}>
          <span {...stylex.props(shared.caption)}>the bytecode</span>
          <ol {...stylex.props(styles.lines)}>
            {lines.map((line) => (
              <li
                key={line.offset}
                // Focus and tap do what hover does, for keyboards and touch screens.
                tabIndex={0}
                onMouseEnter={() => showLine(line)}
                onFocus={() => showLine(line)}
                onClick={() => showLine(line)}
                {...stylex.props(
                  styles.line,
                  isActive(line) && styles.lineActive,
                  jumpTarget === line.offset && styles.lineTarget,
                )}
              >
                <span {...stylex.props(styles.offset)}>@ {line.offset}</span>
                <span {...stylex.props(styles.instruction)}>{line.instruction}</span>
                <span {...stylex.props(styles.bytes)}>{line.bytes}</span>
                <span {...stylex.props(styles.meaning)}>
                  {jumpTarget === line.offset ? "← the jump lands here. " : ""}
                  {line.meaning}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <p {...stylex.props(shared.caption, styles.source)}>
        captured with node --print-bytecode · {NODE_VERSION} · hover or tap an instruction or a node
      </p>
    </Figure>
  );
}
