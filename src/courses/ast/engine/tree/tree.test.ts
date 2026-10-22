import { describe, expect, it } from "vitest";
import { childrenOf, fieldsOf, labelOf } from "./children";
import { pathAt } from "./locate";
import { parseProgram, unwrapExpression } from "@/courses/ast/engine/parsing/parse";
import { astRename, classifyTextEdits, textRename } from "@/courses/ast/engine/scope/rename";
import { applyEdits } from "@/courses/ast/engine/transform/edits";
import { sameTree } from "./walk";

function parse(code: string) {
  const result = parseProgram(code);
  if (!result.ok) throw new Error(result.message);
  return result.ast;
}

describe("parseProgram", () => {
  it("returns syntax errors as data", () => {
    const result = parseProgram("let x = ;");
    expect(result).toMatchObject({ ok: false, pos: 8, line: 1, column: 8 });
    expect(result.ok || result.message).toBe("Unexpected token");
  });

  it("collects comments", () => {
    const result = parseProgram("// hi\nx;");
    expect(result.ok && result.comments).toEqual([{ kind: "Line", text: " hi", start: 0, end: 5 }]);
  });

  it("unwraps a single expression", () => {
    expect(unwrapExpression(parse("a + b")).type).toBe("BinaryExpression");
    expect(unwrapExpression(parse("a; b")).type).toBe("Program");
  });
});

describe("fieldsOf / childrenOf", () => {
  it("lists children in field order with array indexes", () => {
    const call = unwrapExpression(parse("f(a, b)"));
    expect(childrenOf(call).map((c) => [c.key, c.index])).toEqual([
      ["callee", undefined],
      ["arguments", 0],
      ["arguments", 1],
    ]);
  });

  it("keeps scalar fields and empty lists as values", () => {
    const fn = parse("function f() {}").body[0];
    const fields = Object.fromEntries(fieldsOf(fn).map((f) => [f.key, f.kind]));
    expect(fields).toMatchObject({ id: "node", params: "value", body: "node", async: "value" });
  });

  it("labels nodes with their most telling detail", () => {
    expect(labelOf(unwrapExpression(parse("a * b")))).toEqual({
      type: "BinaryExpression",
      detail: "*",
      category: "operator",
    });
    expect(labelOf(unwrapExpression(parse("'hi'"))).category).toBe("string");
  });
});

describe("pathAt", () => {
  it("finds the deepest node at an offset", () => {
    const ast = parse("let total = price * 2;");
    const path = pathAt(ast, 13);
    expect(path.map((n) => n.type)).toEqual([
      "Program",
      "VariableDeclaration",
      "VariableDeclarator",
      "BinaryExpression",
      "Identifier",
    ]);
  });

  it("counts the position right after a node as inside it", () => {
    const path = pathAt(parse("foo"), 3);
    expect(path.at(-1)?.type).toBe("Identifier");
  });
});

describe("sameTree", () => {
  it("ignores parentheses and whitespace", () => {
    const a = unwrapExpression(parse("price * quantity + tax"));
    const b = unwrapExpression(parse("( price*quantity ) + tax"));
    const c = unwrapExpression(parse("price * (quantity + tax)"));
    expect(sameTree(a, b)).toBe(true);
    expect(sameTree(a, c)).toBe(false);
  });
});

describe("rename", () => {
  const code = [
    "let count = 0;",
    "// count the clicks",
    'const label = "count: ";',
    "const stats = { count: count };",
    "console.log(stats.count, { count });",
  ].join("\n");

  it("only renames variables in the AST version", () => {
    const edits = astRename(parse(code), "count", "total");
    expect(applyEdits(code, edits)).toBe(
      [
        "let total = 0;",
        "// count the clicks",
        'const label = "count: ";',
        "const stats = { count: total };",
        "console.log(stats.count, { count: total });",
      ].join("\n"),
    );
  });

  it("flags the text version's mistakes", () => {
    const astEdits = astRename(parse(code), "count", "total");
    const classified = classifyTextEdits(textRename(code, "count", "total"), astEdits);
    expect(classified.filter((e) => !e.correct)).toHaveLength(5);
    expect(classified.filter((e) => e.correct)).toHaveLength(2);
  });

  it("expands shorthand with a default, and keeps import and export names", () => {
    const rename = (source: string) => applyEdits(source, astRename(parse(source), "count", "total"));
    expect(rename("const { count = 1 } = obj; count;")).toBe("const { count: total = 1 } = obj; total;");
    expect(rename('import { count } from "x"; count;')).toBe('import { count as total } from "x"; total;');
    expect(rename('import { a as count } from "x"; count;')).toBe('import { a as total } from "x"; total;');
    expect(rename("let count; export { count };")).toBe("let total; export { total as count };");
    expect(rename("let x; export { x as count };")).toBe("let x; export { x as count };");
  });

  it("does not match partial words", () => {
    expect(textRename("counter count", "count", "x")).toHaveLength(1);
  });
});

describe("lesson 2 rename example", () => {
  it("has exactly the mistakes the lesson describes", async () => {
    const { renameExample } = await import("@/courses/ast/content/examples");
    const astEdits = astRename(parse(renameExample), "count", "total");
    const classified = classifyTextEdits(textRename(renameExample, "count", "total"), astEdits);
    // The comment, the string, `{ count }` and `stats.count`.
    expect(classified.filter((e) => !e.correct)).toHaveLength(4);
    expect(classified.filter((e) => e.correct)).toHaveLength(4);
  });
});
