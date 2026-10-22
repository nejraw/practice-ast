import { useMemo, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { pathAt, pathTo } from "@/courses/ast/engine/tree/locate";
import type { Positioned } from "@/courses/ast/engine/parsing/parse";
import { mapOffset, mapSpan } from "@/courses/ast/engine/parsing/position";
import { shared } from "@/design/shared.styles";
import { CodeEditor, type Highlight } from "@/features/editor/CodeEditor";
import { useParse } from "@/courses/ast/features/tree/useParse";
import { NodeInfo } from "@/courses/ast/features/tree/NodeInfo";
import { TreeView } from "@/courses/ast/features/tree/TreeView";
import { Button } from "@/design/components/Button";
import { presets } from "@/courses/ast/features/explorer/presets";
import { styles } from "./Explorer.styles";

type Selection = { kind: "cursor"; offset: number } | { kind: "node"; node: Positioned } | null;

export function Explorer({ initialCode }: { initialCode?: string }) {
  const [code, setCode] = useState(initialCode ?? presets[0].code);
  // The cursor offset survives re-parsing, so the selection follows the code while typing.
  const [selection, setSelection] = useState<Selection>(null);
  const [hovered, setHovered] = useState<Positioned | null>(null);
  const [showValues, setShowValues] = useState(true);
  // Bumped when an example replaces the code: its tree starts with nothing folded.
  const [example, setExample] = useState(0);
  // The tree on screen, and the code it was parsed from: while the code doesn't
  // parse (or the parse is a keystroke behind), that's an older version.
  // Offsets move between the two, so they're mapped wherever one is used with the other.
  const { result, source, lastGood: ast, lastGoodSource: astSource, stale } = useParse(code);

  const path = useMemo(() => {
    if (!ast || astSource === null || !selection) return [];
    if (selection.kind === "node") return pathTo(ast, selection.node);
    const offset = mapOffset(code, astSource, selection.offset);
    return offset === null ? [] : pathAt(ast, offset);
  }, [ast, astSource, code, selection]);

  const highlights = useMemo<Highlight[]>(() => {
    if (!result.ok) {
      const at = mapOffset(source, code, result.pos) ?? result.pos;
      return [{ start: at, end: at, tone: "error" }];
    }
    const focus = hovered ?? path.at(-1);
    const span = focus && focus.type !== "Program" && astSource !== null ? mapSpan(astSource, code, focus) : null;
    return span ? [{ start: span.start, end: span.end, tone: "focus" }] : [];
  }, [result, source, hovered, path, astSource, code]);

  const selectNode = (node: Positioned) => setSelection({ kind: "node", node });

  return (
    <div {...stylex.props(styles.layout)}>
      <section aria-label="Code" {...stylex.props(styles.column)}>
        <div {...stylex.props(styles.toolbar)}>
          <span {...stylex.props(shared.caption, styles.toolbarLabel)}>Examples</span>
          {presets.map((preset) => (
            <Button
              key={preset.name}
              active={code === preset.code}
              onClick={() => {
                setCode(preset.code);
                setSelection(null);
                setExample((n) => n + 1);
              }}
            >
              {preset.name}
            </Button>
          ))}
        </div>

        <CodeEditor
          value={code}
          onChange={setCode}
          onCursor={(offset) => setSelection({ kind: "cursor", offset })}
          highlights={highlights}
          ariaLabel="JavaScript code"
        />

        {!result.ok && (
          <p role="status" {...stylex.props(styles.error)}>
            <strong>Syntax error</strong> at line {result.line}, column {result.column + 1}: {result.message}
            {stale && <span {...stylex.props(styles.errorHint)}> The tree shows the last version that parsed.</span>}
          </p>
        )}

        <NodeInfo path={path} code={astSource ?? code} onSelect={selectNode} />
      </section>

      <section aria-label="Tree" {...stylex.props(styles.column)}>
        <div {...stylex.props(styles.toolbar)}>
          <span {...stylex.props(shared.caption, styles.toolbarLabel)}>Tree</span>
          <label {...stylex.props(styles.checkbox)}>
            <input type="checkbox" checked={showValues} onChange={(e) => setShowValues(e.target.checked)} />
            Show all fields
          </label>
        </div>
        <div {...stylex.props(styles.treePanel)}>
          {ast ? (
            <TreeView
              key={example}
              root={ast}
              selectedPath={path}
              hovered={hovered}
              onSelect={selectNode}
              onHover={setHovered}
              showValues={showValues}
              dimmed={stale}
            />
          ) : (
            <p {...stylex.props(styles.empty)}>Fix the syntax error to see the tree.</p>
          )}
        </div>
      </section>
    </div>
  );
}
