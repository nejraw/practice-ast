import { describe, expect, it } from "vitest";
import { compareToSource, runTransform, unchangedLines } from "./transform";

const code = `// helpers
var PI = 3.14;

function area(radius) {
  console.log('area of', radius);
  return PI * radius ** 2; // pi r squared
}`;

function ok(id: string) {
  const outcome = runTransform(code, id);
  if (!outcome.ok) throw new Error(outcome.message);
  return outcome;
}

describe("runTransform", () => {
  it("changes a field: var becomes let", () => {
    const outcome = ok("var-to-let");
    expect(outcome.changes).toHaveLength(1);
    expect(outcome.reprinted).toBe(code.replace("var PI", "let PI"));
  });

  it("removes a node from its parent", () => {
    const outcome = ok("remove-console-log");
    expect(outcome.reprinted).not.toContain("console.log");
    expect(outcome.reprinted).toContain("// pi r squared");
  });

  it("replaces part of an expression, adding parentheses where the tree needs them", () => {
    // `PI * radius ** 2` is `PI * (radius ** 2)`, so the new `*` must stay grouped.
    expect(ok("square").reprinted).toContain("PI * (radius * radius); // pi r squared");
  });

  it("recast keeps comments and layout; astring prints from scratch", () => {
    const outcome = ok("var-to-let");
    expect(compareToSource(code, outcome.reprinted).comments).toBe(2);
    expect(compareToSource(code, outcome.regenerated).comments).toBe(0);
  });

  it("counts real comments only, not // inside a string", () => {
    expect(compareToSource("", 'const url = "https://example.com"; // home').comments).toBe(1);
  });

  it("reports syntax errors instead of throwing", () => {
    expect(runTransform("var = ;", "var-to-let").ok).toBe(false);
  });
});

describe("unchangedLines", () => {
  it("lets each line of the source vouch for one printed line", () => {
    expect(unchangedLines("{\n}\n", "{\n}\n}\n}")).toEqual([true, true, false, false]);
    expect(compareToSource("{\n}\n", "{\n}\n}\n}\n")).toMatchObject({ unchangedLines: 2, lines: 4 });
  });
});
