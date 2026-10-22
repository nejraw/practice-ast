import { describe, expect, it } from "vitest";
import { describeNode, miniParse, ruleSpans, type RuleSpan } from "./miniParser";
import { parseProgram, unwrapExpression } from "./parse";
import { sameTree } from "@/courses/ast/engine/tree/walk";

function acornTree(code: string) {
  const result = parseProgram(code);
  if (!result.ok) throw new Error(result.message);
  return unwrapExpression(result.ast);
}

describe("miniParse", () => {
  it("reads number literals the way acorn does", () => {
    for (const code of ["1_000 + 2", "10n * 2n", "0x1F % 3"]) {
      expect(sameTree(miniParse(code).tree!, acornTree(code))).toBe(true);
    }
    expect(describeNode(miniParse("1_000 + 2").tree!)).toBe("1000 + 2");
  });

  it.each(["a + b * c", "(a + b) * c", "a - b - c", "2 * (price + 3) % n", "x"])("builds the same tree as acorn for %s", (code) => {
    const { tree } = miniParse(code);
    expect(tree && sameTree(tree, acornTree(code))).toBe(true);
  });

  it("builds leaves first and joins them into bigger pieces", () => {
    const builds = miniParse("a + b * c").steps.filter((step) => step.kind === "build").map((step) => describeNode(step.node!));
    expect(builds).toEqual(["a", "b", "c", "b * c", "a + (b * c)"]);
  });

  it("keeps unattached pieces in source order", () => {
    const { steps } = miniParse("a + b * c");
    const beforeJoin = steps.findLast((step) => step.kind === "build" && describeNode(step.node!) === "c")!;
    expect(beforeJoin.pieces.map(describeNode)).toEqual(["a", "b", "c"]);
  });

  it("calls rules top-down: expression, then term, then factor", () => {
    const first = miniParse("a").steps.filter((step) => step.kind === "call").map((step) => step.stack.at(-1)!.rule);
    expect(first).toEqual(["expression", "term", "factor"]);
  });

  it("stops with a clear message at a missing parenthesis", () => {
    const last = miniParse("a * (b + c").steps.at(-1)!;
    expect(last.kind).toBe("error");
    expect(last.message).toContain("expected )");
    expect(last.pieces.map(describeNode)).toEqual(["a", "b + c"]);
  });

  it("rejects leftover tokens", () => {
    expect(miniParse("a b").steps.at(-1)!.message).toContain("left over");
  });
});

describe("ruleSpans", () => {
  const show = (span: RuleSpan): string =>
    span.children.length ? `${span.rule}[${span.children.map(show).join(" ")}]` : `${span.rule}`;

  it("nests rules the way the grammar shapes the code", () => {
    // a + b * c: one expression of two terms; the second term has two factors.
    expect(show(ruleSpans(miniParse("a + b * c"))!)).toBe("expression[term[factor] term[factor factor]]");
  });

  it("covers the tokens each rule read", () => {
    const span = ruleSpans(miniParse("a + b * c"))!;
    expect(span.children.map((child) => [child.start, child.end])).toEqual([[0, 1], [2, 5]]);
  });

  it("is null when the code doesn't fit", () => {
    expect(ruleSpans(miniParse("a * (b"))).toBeNull();
  });
});
