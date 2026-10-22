import { describe, expect, it } from "vitest";
import { compile, describeInstruction, execute, variablesOf } from "./machine";
import { parseProgram, unwrapExpression } from "@/courses/ast/engine/parsing/parse";

function compileExpression(code: string) {
  const result = parseProgram(code);
  if (!result.ok) throw new Error(result.message);
  return compile(unwrapExpression(result.ast));
}

describe("compile", () => {
  it("flattens the tree children-first", () => {
    const result = compileExpression("price * quantity + tax");
    expect(result.ok && result.program.map(describeInstruction)).toEqual([
      "get price",
      "get quantity",
      "multiply (*)",
      "get tax",
      "add (+)",
    ]);
  });

  it("follows the tree, not the text order", () => {
    const result = compileExpression("price * (quantity + tax)");
    expect(result.ok && result.program.map(describeInstruction)).toEqual([
      "get price",
      "get quantity",
      "get tax",
      "add (+)",
      "multiply (*)",
    ]);
  });

  it("points at the first node it can't handle", () => {
    const result = compileExpression("1 + f()");
    expect(result).toMatchObject({ ok: false, node: { type: "CallExpression" } });
  });
});

describe("execute", () => {
  it("runs the steps with a stack", () => {
    const result = compileExpression("price * quantity + tax");
    if (!result.ok) throw new Error(result.message);
    const run = execute(result.program, { price: 10, quantity: 2, tax: 3 });
    expect(run.ok && run.trace.map((step) => step.stack)).toEqual([[10], [10, 2], [20], [20, 3], [23]]);
  });

  it("reports unknown variables", () => {
    const result = compileExpression("a + b");
    if (!result.ok) throw new Error(result.message);
    expect(execute(result.program, { a: 1 })).toMatchObject({ ok: false, message: "b is not defined" });
    expect(variablesOf(result.program)).toEqual(["a", "b"]);
  });
});
