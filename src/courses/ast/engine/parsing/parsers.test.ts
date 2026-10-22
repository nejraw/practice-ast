import { describe, expect, it } from "vitest";
import { parsers, type Language, type ParserId } from "./parsers";

const run = (id: ParserId, code: string, language: Language) => parsers.find((p) => p.id === id)!.run(code, language);
const labels = async (id: ParserId, code: string, language: Language = "js") =>
  (await run(id, code, language)).rows?.map((row) => row.label);

describe("parsers", () => {
  const code = "const total = price * 2;";

  it("gives the same ESTree shape from acorn, a wrapped variant from Babel, and TypeScript's own", async () => {
    expect(await labels("acorn", code)).toEqual(["Program", "VariableDeclaration", "VariableDeclarator", "Identifier", "BinaryExpression", "Identifier", "Literal"]);
    expect(await labels("babel", code)).toEqual(["File", "Program", "VariableDeclaration", "VariableDeclarator", "Identifier", "BinaryExpression", "Identifier", "NumericLiteral"]);
    expect(await labels("typescript", code)).toEqual([
      "SourceFile",
      "VariableStatement",
      "VariableDeclarationList",
      "VariableDeclaration",
      "Identifier",
      "BinaryExpression",
      "Identifier",
      "AsteriskToken",
      "NumericLiteral",
      "EndOfFileToken",
    ]);
  });

  it("uses positions without leading whitespace for TypeScript", async () => {
    const rows = (await run("typescript", code, "js")).rows!;
    expect(rows.find((row) => row.detail === "total")).toMatchObject({ start: 6, end: 11 });
  });

  it("acorn rejects type annotations; Babel and TypeScript accept them", async () => {
    const typed = "const total: number = 1;";
    expect((await run("acorn", typed, "ts")).rows).toBeNull();
    expect(await labels("babel", typed, "ts")).toContain("TSNumberKeyword");
    expect(await labels("typescript", typed, "ts")).toContain("NumberKeyword");
  });

  it("TypeScript still builds a tree when the code has a syntax error", async () => {
    const outcome = await run("typescript", "const total = price *;", "js");
    expect(outcome.error).toBeTruthy();
    expect(outcome.rows?.length).toBeGreaterThan(3);
  });

  it("says on which line each parser stopped", async () => {
    for (const parser of parsers) {
      expect((await parser.run("let a = 1;\nlet = ;", "js")).error).toMatch(/\(line 2\)$/);
    }
  });
});
