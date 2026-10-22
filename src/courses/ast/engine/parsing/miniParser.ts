import type * as ESTree from "estree";
import type { Positioned } from "./parse";
import { tokenize, tokensOf } from "./tokens";

/**
 * A tiny recursive descent parser for arithmetic, built to be watched.
 *
 * It follows a three-rule grammar, with one function per rule, and records
 * every call, every token it reads, every node it builds and every return.
 * It produces the same ESTree nodes as acorn for the code it understands.
 */

export const grammar = [
  { rule: "expression", text: 'expression → term   (("+" | "-") term)*' },
  { rule: "term", text: 'term       → factor (("*" | "/" | "%") factor)*' },
  { rule: "factor", text: 'factor     → number | name | "(" expression ")"' },
] as const;

export type Rule = (typeof grammar)[number]["rule"];

export interface Token {
  text: string;
  start: number;
  end: number;
  kind: "name" | "number" | "punct";
}

export interface Frame {
  rule: Rule;
  /** The left-hand side built so far, waiting for an operator and its right-hand side. */
  left?: Positioned;
  /** An operator that has been read, waiting for its right-hand side. */
  operator?: string;
}

export type StepKind = "call" | "read" | "build" | "return" | "error";

export interface Step {
  kind: StepKind;
  /** What happened, in a sentence. */
  message: string;
  /** Call stack after this step, outermost first. */
  stack: Frame[];
  /** Index of the next unread token after this step. */
  cursor: number;
  /** Built nodes not yet part of a bigger node, left to right. */
  pieces: Positioned[];
  /** The node this step built or returned, if any. */
  node?: Positioned;
  /** The token this step read, if any. */
  token?: Token;
}

export interface MiniParse {
  tokens: Token[];
  steps: Step[];
  /** The finished tree, if parsing succeeded. */
  tree?: Positioned;
}

class ParseError extends Error {}

/** A number literal as acorn builds it: `1_000` is 1000, and `10n` is a BigInt with a `bigint` field. */
function numberLiteral(token: Token): Positioned {
  const digits = token.text.replace(/_/g, "");
  const { start, end, text: raw } = token;
  const node = digits.endsWith("n")
    ? { type: "Literal", value: BigInt(digits.slice(0, -1)), raw, bigint: digits.slice(0, -1), start, end }
    : { type: "Literal", value: Number(digits), raw, start, end };
  return node as unknown as Positioned;
}

export function describeNode(node: Positioned): string {
  switch (node.type) {
    case "Identifier":
      return (node as ESTree.Identifier).name;
    case "Literal":
      return String((node as ESTree.Literal).value);
    case "BinaryExpression": {
      const { left, operator, right } = node as ESTree.BinaryExpression;
      const side = (child: Positioned) => {
        const text = describeNode(child);
        return child.type === "BinaryExpression" ? `(${text})` : text;
      };
      return `${side(left as Positioned)} ${operator} ${side(right as Positioned)}`;
    }
    default:
      return node.type;
  }
}

export function miniParse(code: string): MiniParse {
  const lexed = tokenize(code);
  const tokens: Token[] = tokensOf(lexed).map((token) => ({
    text: token.text,
    start: token.start,
    end: token.end,
    kind: token.category === "name" ? "name" : token.category === "number" ? "number" : "punct",
  }));
  const steps: Step[] = [];
  const stack: Frame[] = [];
  let pieces: Positioned[] = [];
  let cursor = 0;

  const record = (kind: StepKind, message: string, extra: Partial<Step> = {}) => {
    steps.push({ kind, message, stack: stack.map((frame) => ({ ...frame })), cursor, pieces: [...pieces], ...extra });
  };
  const fail = (message: string): never => {
    record("error", message);
    throw new ParseError(message);
  };
  const peek = () => tokens[cursor];
  const read = (why: string) => {
    const token = tokens[cursor];
    cursor += 1;
    record("read", `${stack.at(-1)!.rule}() reads ${token.text}${why}.`, { token });
    return token;
  };
  // A finished node replaces the pieces it was built from.
  const build = (node: Positioned, from: Positioned[], message: string) => {
    const at = from.length ? pieces.indexOf(from[0]) : pieces.length;
    pieces = pieces.filter((piece) => !from.includes(piece));
    pieces.splice(at < 0 ? pieces.length : at, 0, node);
    record("build", message, { node });
    return node;
  };

  const call = (rule: Rule, body: () => Positioned): Positioned => {
    stack.push({ rule });
    record("call", `${stack.length > 1 ? `${stack.at(-2)!.rule}() calls ` : "Start with "}${rule}().`);
    const node = body();
    stack.pop();
    record("return", `${rule}() returns ${describeNode(node)}.`, { node });
    return node;
  };

  // expression and term have the same shape: one operand, then any number of "operator operand".
  const binary = (rule: "expression" | "term", operators: string[], operand: () => Positioned) =>
    call(rule, () => {
      const frame = stack.at(-1)!;
      let left = operand();
      frame.left = left;
      while (peek() && operators.includes(peek().text)) {
        const operator = read(`, an operator ${rule} handles`).text;
        frame.operator = operator;
        const right = operand();
        const node = { type: "BinaryExpression", start: left.start, end: right.end, left, operator, right } as unknown as Positioned;
        frame.operator = undefined;
        left = build(node, [left, right], `${rule}() joins ${describeNode(left)} and ${describeNode(right)} into a BinaryExpression.`);
        frame.left = left;
      }
      return left;
    });

  const expression = (): Positioned => binary("expression", ["+", "-"], term);
  const term = (): Positioned => binary("term", ["*", "/", "%"], factor);
  const factor = (): Positioned =>
    call("factor", () => {
      const token = peek();
      if (!token) return fail("factor() needs a number, a name or (, but the code has ended.");
      if (token.kind === "number" || token.kind === "name") {
        read(token.kind === "number" ? ", a number" : ", a name");
        const node =
          token.kind === "number"
            ? numberLiteral(token)
            : ({ type: "Identifier", name: token.text, start: token.start, end: token.end } as unknown as Positioned);
        return build(node, [], `factor() builds ${token.kind === "number" ? "a Literal" : "an Identifier"}.`);
      }
      if (token.text === "(") {
        read(", so a whole expression must follow");
        const inner = expression();
        if (peek()?.text !== ")") {
          return fail(`factor() expected ) to close the parenthesis, but found ${peek() ? peek().text : "the end of the code"}.`);
        }
        read(". The parentheses are done: they shaped the tree but get no node of their own");
        return inner;
      }
      return fail(`factor() needs a number, a name or (, but found ${token.text}.`);
    });

  if (lexed.error) {
    record("error", `The tokenizer got stuck: ${lexed.error.message}.`);
    return { tokens, steps };
  }
  try {
    const tree = expression();
    if (cursor < tokens.length) {
      fail(`expression() is done, but ${peek().text} is left over. No rule in this grammar allows it here.`);
    }
    return { tokens, steps, tree };
  } catch (error) {
    if (error instanceof ParseError) return { tokens, steps };
    throw error;
  }
}

/** The tokens one rule matched, and the rules it matched inside them. */
export interface RuleSpan {
  rule: Rule;
  /** Token indexes: `start` is the first token, `end` is one past the last. */
  start: number;
  end: number;
  children: RuleSpan[];
}

/**
 * Which rule matched which tokens, as nested spans: the shape the grammar
 * gives the code. Rebuilt from the parser's calls and returns. Null if the
 * code doesn't fit the grammar.
 */
export function ruleSpans(parse: MiniParse): RuleSpan | null {
  if (!parse.tree) return null;
  const open: RuleSpan[] = [];
  let root: RuleSpan | null = null;
  for (const step of parse.steps) {
    if (step.kind === "call") {
      const span: RuleSpan = { rule: step.stack.at(-1)!.rule, start: step.cursor, end: step.cursor, children: [] };
      open.at(-1)?.children.push(span);
      open.push(span);
    } else if (step.kind === "return") {
      const span = open.pop()!;
      span.end = step.cursor;
      root = span;
    }
  }
  return root;
}
