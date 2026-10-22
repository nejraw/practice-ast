import { describe, expect, it } from "vitest";
import { parseProgram } from "@/courses/ast/engine/parsing/parse";
import { applyEdits } from "@/courses/ast/engine/transform/edits";
import { analyzeScopes, bindingAt, renameBinding, renameConflict } from "./scope";

function analyzed(code: string) {
  const result = parseProgram(code);
  if (!result.ok) throw new Error(result.message);
  return { ast: result.ast, analysis: analyzeScopes(result.ast) };
}

const shadow = `let count = 0;
function tally(items) {
  let count = items.length;
  return count;
}
count = tally([1, 2]);`;

describe("analyzeScopes", () => {
  it("tells two variables with the same name apart", () => {
    const { analysis } = analyzed(shadow);
    const counts = analysis.bindings.filter((binding) => binding.name === "count");
    expect(counts).toHaveLength(2);
    expect(counts.map((binding) => binding.scope.type)).toEqual(["module", "function"]);
    expect(counts.map((binding) => binding.occurrences.length)).toEqual([2, 2]);
  });

  it("finds the binding under the cursor", () => {
    const { analysis } = analyzed(shadow);
    const inner = shadow.indexOf("return count") + "return ".length;
    expect(bindingAt(analysis, inner)?.scope.type).toBe("function");
    expect(bindingAt(analysis, 4)?.scope.type).toBe("module");
  });

  it("marks variables used by an inner function as captured", () => {
    const { analysis } = analyzed("function counter() {\n  let count = 0;\n  let unused = 1;\n  return () => ++count;\n}");
    const byName = Object.fromEntries(analysis.bindings.map((binding) => [binding.name, binding.captured]));
    expect(byName).toMatchObject({ count: true, unused: false });
  });

  it("lists undeclared names as globals", () => {
    const { analysis } = analyzed("console.log(window.x);");
    expect(analysis.globals.map((global) => global.name)).toEqual(["console", "window"]);
  });
});

describe("renameBinding", () => {
  it("renames one variable and leaves a shadowing one alone", () => {
    const { ast, analysis } = analyzed(shadow);
    const outer = analysis.bindings.find((binding) => binding.name === "count" && binding.scope.type === "module")!;
    expect(applyEdits(shadow, renameBinding(ast, outer, "total"))).toBe(shadow.replace("let count = 0", "let total = 0").replace("count = tally", "total = tally"));
  });

  it("expands shorthand with a default, and keeps import names", () => {
    const code = 'import { count } from "x";\nconst { size = count } = {};';
    const { ast, analysis } = analyzed(code);
    const rename = (name: string, to: string) => applyEdits(code, renameBinding(ast, analysis.bindings.find((b) => b.name === name)!, to));
    expect(rename("count", "total")).toBe('import { count as total } from "x";\nconst { size = total } = {};');
    expect(rename("size", "n")).toBe('import { count } from "x";\nconst { size: n = count } = {};');
  });

  it("keeps property names when expanding shorthand", () => {
    const code = "let count = 1;\nconst stats = { count };";
    const { ast, analysis } = analyzed(code);
    expect(applyEdits(code, renameBinding(ast, analysis.bindings[0], "total"))).toBe("let total = 1;\nconst stats = { count: total };");
  });
});

describe("renameConflict", () => {
  const conflict = (code: string, at: number, to: string) => {
    const { analysis } = analyzed(code);
    return renameConflict(analysis, bindingAt(analysis, at)!, to, code);
  };

  it("allows a rename that changes nothing else", () => {
    expect(conflict(shadow, 4, "total")).toBeNull();
    expect(conflict(shadow, 4, "count")).toBeNull();
  });

  it("refuses names that aren't allowed", () => {
    expect(conflict("let a = 1;", 4, "class")).toMatch(/reserved/);
    expect(conflict("let a = 1;", 4, "await")).toMatch(/reserved/);
    expect(conflict("let a = 1;", 4, "1x")).toMatch(/not a valid name/);
  });

  it("refuses a name already declared in the same scope", () => {
    expect(conflict("let a = 1; let b = 2; a;", 4, "b")).toMatch(/already declared .* line 1/);
  });

  it("refuses when an inner variable would capture a use of the renamed one", () => {
    expect(conflict("let a = 1;\nfunction f() {\n  let b = 2;\n  return a + b;\n}", 4, "b")).toMatch(/On line 4, b already means/);
  });

  it("refuses when the renamed variable would hide an outer one", () => {
    const code = "let b = 1;\nfunction f() {\n  let a = 2;\n  return a + b;\n}";
    expect(conflict(code, code.indexOf("a = 2"), "b")).toMatch(/On line 4, b refers to another variable/);
    expect(conflict("function f() {\n  let a = 1;\n  console.log(a);\n}", 21, "console")).toMatch(/line 3/);
  });

  it("allows a name that's only used in an unrelated scope", () => {
    expect(conflict("function f() { let a = 1; return a; }\nfunction g() { let b = 2; return b; }", 19, "b")).toBeNull();
  });
});

