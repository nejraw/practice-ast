import { useDeferredValue, useMemo, useState } from "react";
import type * as ESTree from "estree";
import { parseProgram, type ParseResult, type Positioned } from "@/courses/ast/engine/parsing/parse";

export interface ParseState {
  result: ParseResult;
  /**
   * The code `result` was parsed from. Parsing is deferred, so this can lag a
   * keystroke behind the editor: offsets in the tree belong to this text, not
   * necessarily to the editor's.
   */
  source: string;
  /** The most recent successful tree, so a half-typed line doesn't blank the screen. */
  lastGood: Positioned<ESTree.Program> | null;
  /** The code `lastGood` was parsed from: its offsets belong to this text. */
  lastGoodSource: string | null;
  /** True while showing `lastGood` because the current code has a syntax error. */
  stale: boolean;
}

export function useParse(code: string): ParseState {
  // Parsing runs on a deferred value, so typing in the editor stays responsive.
  const source = useDeferredValue(code);
  const result = useMemo(() => parseProgram(source), [source]);
  // Kept in state, updated during render when a new tree parses: React's pattern for
  // state derived from the previous render, and safe in concurrent rendering, unlike a ref.
  const [lastGood, setLastGood] = useState<{ ast: Positioned<ESTree.Program>; source: string } | null>(null);
  if (result.ok && lastGood?.ast !== result.ast) setLastGood({ ast: result.ast, source });
  const good = result.ok ? { ast: result.ast, source } : lastGood;
  return {
    result,
    source,
    lastGood: good?.ast ?? null,
    lastGoodSource: good?.source ?? null,
    stale: !result.ok && good !== null,
  };
}
