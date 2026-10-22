import type { Span } from "@/courses/ast/engine/parsing/position";

/** A change to source text: what is in `start`–`end` becomes `replacement`. */
export interface Edit extends Span {
  replacement: string;
}

export function applyEdits(code: string, edits: Edit[]): string {
  return applyEditsTracked(code, edits).code;
}

/** Applies edits and reports where each replacement ended up in the new code. */
export function applyEditsTracked<E extends Edit>(
  code: string,
  edits: E[],
): { code: string; placed: Array<Span & { edit: E }> } {
  let result = "";
  let last = 0;
  const placed: Array<Span & { edit: E }> = [];
  for (const edit of [...edits].sort((a, b) => a.start - b.start)) {
    result += code.slice(last, edit.start);
    placed.push({ start: result.length, end: result.length + edit.replacement.length, edit });
    result += edit.replacement;
    last = edit.end;
  }
  return { code: result + code.slice(last), placed };
}
