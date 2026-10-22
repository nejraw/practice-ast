/** A stretch of source code, as character offsets: `start` is included, `end` is not. */
export interface Span {
  start: number;
  end: number;
}

/** Line (from 1) of an offset. */
export function lineAt(code: string, offset: number): number {
  return code.slice(0, offset).split("\n").length;
}

/** Line and column (both from 1) of an offset. */
export function lineAndColumn(code: string, offset: number) {
  const before = code.slice(0, offset).split("\n");
  return { line: before.length, column: before[before.length - 1].length + 1 };
}

/**
 * The same place in another version of the code, or null if the offset is in
 * the stretch that was edited. Text before and after the edit is matched from
 * both ends, so a tree of one version can be used with the other, e.g. while
 * the latest code has a syntax error and the tree is from the last that parsed.
 */
export function mapOffset(from: string, to: string, offset: number): number | null {
  if (from === to) return offset;
  const shortest = Math.min(from.length, to.length);
  let prefix = 0;
  while (prefix < shortest && from[prefix] === to[prefix]) prefix++;
  if (offset <= prefix) return offset;
  let suffix = 0;
  while (suffix < shortest - prefix && from[from.length - 1 - suffix] === to[to.length - 1 - suffix]) suffix++;
  return offset >= from.length - suffix ? offset + to.length - from.length : null;
}

/** A span in another version of the code, or null if either end is in the edited stretch. */
export function mapSpan<T extends Span>(from: string, to: string, span: T): T | null {
  const start = mapOffset(from, to, span.start);
  const end = mapOffset(from, to, span.end);
  return start === null || end === null || end < start ? null : { ...span, start, end };
}

/** acorn and Babel end their error messages with " (line:column)"; the UI shows the position separately. */
export function withoutPosition(message: string): string {
  return message.replace(/\s*\(\d+:\d+\)$/, "");
}
