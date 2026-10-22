import { tokenizer, type Comment, type TokenType } from "acorn";
import { withoutPosition } from "./position";

/**
 * Splits source code into tokens, keeping track of what the tokenizer skipped
 * (whitespace, newlines and comments) so a lesson can show both.
 */

export type TokenCategory =
  | "name"
  | "keyword"
  | "number"
  | "string"
  | "template"
  | "regexp"
  | "operator"
  | "punctuation";

export type SkippedKind = "whitespace" | "newline" | "comment";

export type Piece =
  | { kind: "token"; category: TokenCategory; start: number; end: number; text: string }
  | { kind: "skipped"; what: SkippedKind; start: number; end: number; text: string };

export interface TokenizeResult {
  pieces: Piece[];
  /** Set when the tokenizer stopped early, e.g. on an unterminated string. */
  error?: { message: string; pos: number };
}

const PUNCTUATION = new Set(["(", ")", "[", "]", "{", "}", ";", ",", ":", ".", "`", "${", "#"]);

function categoryOf(type: TokenType): TokenCategory {
  if (type.keyword) return "keyword";
  switch (type.label) {
    case "name":
    case "privateId":
      return "name";
    case "num":
      return "number";
    case "string":
      return "string";
    case "template":
    case "invalidTemplate":
      return "template";
    case "regexp":
      return "regexp";
  }
  return PUNCTUATION.has(type.label) ? "punctuation" : "operator";
}

/** Splits the text between two tokens into comments, newlines and other whitespace. */
function skippedBetween(code: string, from: number, to: number, comments: Comment[]): Piece[] {
  const pieces: Piece[] = [];
  const push = (what: SkippedKind, start: number, end: number) => {
    if (end > start) pieces.push({ kind: "skipped", what, start, end, text: code.slice(start, end) });
  };
  const whitespace = (start: number, end: number) => {
    // Newlines get their own piece: unlike other whitespace, they can change the meaning.
    for (const match of code.slice(start, end).matchAll(/(\r\n|[\n\r\u2028\u2029])|[^\n\r\u2028\u2029]+/g)) {
      push(match[1] ? "newline" : "whitespace", start + match.index, start + match.index + match[0].length);
    }
  };
  let at = from;
  for (const comment of comments) {
    if (comment.start < from || comment.end > to) continue;
    whitespace(at, comment.start);
    push("comment", comment.start, comment.end);
    at = comment.end;
  }
  whitespace(at, to);
  return pieces;
}

export function tokenize(code: string): TokenizeResult {
  const comments: Comment[] = [];
  const pieces: Piece[] = [];
  let at = 0;
  const tokens = tokenizer(code, {
    ecmaVersion: "latest",
    sourceType: "module",
    allowReturnOutsideFunction: true,
    onComment: comments,
  });

  try {
    for (const token of tokens) {
      // An empty template part (as in `${a}`) has no characters to show.
      if (token.end === token.start) continue;
      pieces.push(...skippedBetween(code, at, token.start, comments));
      pieces.push({ kind: "token", category: categoryOf(token.type), start: token.start, end: token.end, text: code.slice(token.start, token.end) });
      at = token.end;
    }
  } catch (error) {
    const pos = (error as { pos?: number }).pos ?? at;
    const message = withoutPosition((error as Error).message);
    return { pieces: [...pieces, ...skippedBetween(code, at, Math.min(pos, code.length), comments)], error: { message, pos } };
  }
  pieces.push(...skippedBetween(code, at, code.length, comments));
  return { pieces };
}

export function tokensOf(result: TokenizeResult) {
  return result.pieces.filter((piece) => piece.kind === "token");
}
