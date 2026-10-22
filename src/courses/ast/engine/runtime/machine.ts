import type * as ESTree from "estree";
import type { Positioned } from "@/courses/ast/engine/parsing/parse";

/**
 * A tiny stack machine: the most basic way to run code from a tree.
 *
 * `compile` walks the tree children-first and writes one instruction per node,
 * flattening the tree into a list of steps. `execute` then runs those steps
 * with a stack, the same idea (in miniature) as an engine's bytecode.
 */

export type Instruction =
  | { op: "load"; name: string; node: Positioned }
  | { op: "push"; value: Value; node: Positioned }
  | { op: "binary"; operator: string; node: Positioned }
  | { op: "unary"; operator: string; node: Positioned };

export type Value = number | string | boolean | null;

export type CompileResult = { ok: true; program: Instruction[] } | { ok: false; message: string; node: Positioned };

const BINARY: Record<string, { name: string; apply: (a: Value, b: Value) => Value }> = {
  "+": { name: "add", apply: (a, b) => (a as number) + (b as number) },
  "-": { name: "subtract", apply: (a, b) => (a as number) - (b as number) },
  "*": { name: "multiply", apply: (a, b) => (a as number) * (b as number) },
  "/": { name: "divide", apply: (a, b) => (a as number) / (b as number) },
  "%": { name: "remainder", apply: (a, b) => (a as number) % (b as number) },
  "**": { name: "power", apply: (a, b) => (a as number) ** (b as number) },
  "===": { name: "equal?", apply: (a, b) => a === b },
  "!==": { name: "not equal?", apply: (a, b) => a !== b },
  "<": { name: "less than?", apply: (a, b) => (a as number) < (b as number) },
  "<=": { name: "at most?", apply: (a, b) => (a as number) <= (b as number) },
  ">": { name: "greater than?", apply: (a, b) => (a as number) > (b as number) },
  ">=": { name: "at least?", apply: (a, b) => (a as number) >= (b as number) },
};

const UNARY: Record<string, { name: string; apply: (a: Value) => Value }> = {
  "-": { name: "negate", apply: (a) => -(a as number) },
  "+": { name: "to number", apply: (a) => Number(a) },
  "!": { name: "not", apply: (a) => !a },
};

export function compile(root: Positioned): CompileResult {
  const program: Instruction[] = [];
  type Failure = { message: string; node: Positioned } | null;

  const visit = (node: Positioned): Failure => {
    switch (node.type) {
      case "Identifier":
        program.push({ op: "load", name: (node as ESTree.Identifier).name, node });
        return null;
      case "Literal": {
        const { value } = node as ESTree.Literal;
        if (value instanceof RegExp || typeof value === "bigint" || value === undefined) {
          return { message: "this machine only understands numbers, strings, booleans and null", node };
        }
        program.push({ op: "push", value, node });
        return null;
      }
      case "BinaryExpression": {
        const { operator, left, right } = node as ESTree.BinaryExpression;
        if (!BINARY[operator]) return { message: `this machine doesn't know the ${operator} operator`, node };
        // Children first: both operands must be on the stack before the operator runs.
        const failure = visit(left as Positioned) ?? visit(right as Positioned);
        if (!failure) program.push({ op: "binary", operator, node });
        return failure;
      }
      case "UnaryExpression": {
        const { operator, argument } = node as ESTree.UnaryExpression;
        if (!UNARY[operator]) return { message: `this machine doesn't know the ${operator} operator`, node };
        const failure = visit(argument as Positioned);
        if (!failure) program.push({ op: "unary", operator, node });
        return failure;
      }
      default:
        return { message: `this machine doesn't understand ${node.type} yet`, node };
    }
  };

  const failure = visit(root);
  return failure ? { ok: false, ...failure } : { ok: true, program };
}

/** Plain-language name of a step, e.g. "get price" or "multiply (*)". */
export function describeInstruction(instruction: Instruction): string {
  switch (instruction.op) {
    case "load":
      return `get ${instruction.name}`;
    case "push":
      return `use ${JSON.stringify(instruction.value)}`;
    case "binary":
      return `${BINARY[instruction.operator].name} (${instruction.operator})`;
    case "unary":
      return `${UNARY[instruction.operator].name} (${instruction.operator})`;
  }
}

export interface TraceStep {
  instruction: Instruction;
  /** The value this step produced: the result of its node. */
  value: Value;
  /** The stack after this step. */
  stack: Value[];
}

export type ExecuteResult = { ok: true; trace: TraceStep[] } | { ok: false; message: string; trace: TraceStep[] };

export function execute(program: Instruction[], variables: Record<string, Value>): ExecuteResult {
  const stack: Value[] = [];
  const trace: TraceStep[] = [];

  for (const instruction of program) {
    let value: Value;
    switch (instruction.op) {
      case "load":
        if (!(instruction.name in variables)) {
          return { ok: false, message: `${instruction.name} is not defined`, trace };
        }
        value = variables[instruction.name];
        break;
      case "push":
        value = instruction.value;
        break;
      case "binary": {
        const right = stack.pop()!;
        const left = stack.pop()!;
        value = BINARY[instruction.operator].apply(left, right);
        break;
      }
      case "unary":
        value = UNARY[instruction.operator].apply(stack.pop()!);
        break;
    }
    stack.push(value);
    trace.push({ instruction, value, stack: [...stack] });
  }
  return { ok: true, trace };
}

/** Variable names in the order the machine will load them. */
export function variablesOf(program: Instruction[]): string[] {
  return [...new Set(program.flatMap((instruction) => (instruction.op === "load" ? [instruction.name] : [])))];
}
