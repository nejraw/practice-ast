import { parse } from "acorn";
import type * as ESTree from "estree";
import { withoutPosition } from "./position";

/** acorn adds character offsets to every node. */
export type Positioned<T extends ESTree.Node = ESTree.Node> = T & {
  start: number;
  end: number;
};

export interface CommentInfo {
  kind: "Line" | "Block";
  text: string;
  start: number;
  end: number;
}

export type ParseResult =
  | { ok: true; ast: Positioned<ESTree.Program>; comments: CommentInfo[] }
  | { ok: false; message: string; pos: number; line: number; column: number };

interface AcornSyntaxError extends SyntaxError {
  pos: number;
  loc: { line: number; column: number };
}

function isAcornError(error: unknown): error is AcornSyntaxError {
  return error instanceof SyntaxError && typeof (error as Partial<AcornSyntaxError>).pos === "number";
}

/**
 * Parses a whole program. Never throws: a syntax error is a normal state while
 * someone is typing, so it is returned as data for the UI to render.
 */
export function parseProgram(code: string): ParseResult {
  const comments: CommentInfo[] = [];
  try {
    const ast = parse(code, {
      ecmaVersion: "latest",
      sourceType: "module",
      locations: true,
      // eslint-scope (lesson 6) reads `range`; the tree views ignore it.
      ranges: true,
      onComment: (block, text, start, end) => {
        comments.push({ kind: block ? "Block" : "Line", text, start, end });
      },
    });
    return { ok: true, ast: ast as unknown as Positioned<ESTree.Program>, comments };
  } catch (error) {
    if (isAcornError(error)) {
      return {
        ok: false,
        message: withoutPosition(error.message),
        pos: error.pos,
        line: error.loc.line,
        column: error.loc.column,
      };
    }
    throw error;
  }
}

/**
 * For small demos: if the program is a single expression statement, return
 * just that expression, so the tree starts where the interesting part starts.
 */
export function unwrapExpression(program: Positioned<ESTree.Program>): Positioned {
  const [only] = program.body;
  if (program.body.length === 1 && only.type === "ExpressionStatement") {
    return only.expression as Positioned;
  }
  return program;
}
