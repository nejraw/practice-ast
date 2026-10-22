import { describe, expect, it } from "vitest";
import { rulePresets, ruleTarget } from "@/courses/ast/content/examples";
import { applyFixes, runRule } from "./ruleRunner";

const preset = (label: string) => rulePresets.find((p) => p.label === label)!.rule;

function reports(label: string, code = ruleTarget) {
  const outcome = runRule(preset(label), code);
  if (!outcome.ok) throw new Error(outcome.message);
  return outcome.reports;
}

describe("runRule", () => {
  it("runs every preset on the lesson's code", () => {
    expect(reports("no-var").map((r) => r.line)).toEqual([1]);
    expect(reports("no-console").map((r) => r.message)).toEqual(["Unexpected console.log.", "Unexpected console.warn."]);
    expect(reports("max-params").map((r) => r.message)).toEqual(["addItem has 3 parameters; the limit is 2."]);
    expect(reports("deepest nesting").map((r) => r.line)).toEqual([5]);
  });

  it("applies fixes", () => {
    const code = "var a = 1;\nvar b = 2;";
    expect(applyFixes(code, reports("no-var", code))).toBe("let a = 1;\nlet b = 2;");
  });

  it("requires meta.fixable for fixes, like ESLint", () => {
    const outcome = runRule(preset("no-var").replace('meta: { fixable: "code" },', ""), "var a;");
    expect(outcome).toMatchObject({ ok: false, where: "rule" });
  });

  it("gives every node its parent, like ESLint", () => {
    const rule = `const rule = { create(context) { return {
      Identifier(node) { if (node.parent.type === "CallExpression" && node.parent.callee === node) context.report({ node, message: "called" }); },
    }; } };`;
    expect(runRule(rule, "f(x); y;")).toMatchObject({ ok: true, reports: [{ start: 0, end: 1 }] });
  });

  it("links every parent before the first visitor runs", () => {
    const rule = `const rule = { create(context) { return {
      Program(node) { context.report({ node, message: node.body[0].expression.parent.type }); },
    }; } };`;
    expect(runRule(rule, "a;")).toMatchObject({ ok: true, reports: [{ message: "ExpressionStatement" }] });
  });

  it("accepts a fix that yields its edits, as ESLint does", () => {
    const rule = `const rule = { meta: { fixable: "code" }, create(context) { return {
      Identifier(node) { context.report({ node, message: "x", *fix(fixer) { yield fixer.insertTextBefore(node, "_"); yield fixer.insertTextAfter(node, "_"); } }); },
    }; } };`;
    const outcome = runRule(rule, "a;");
    if (!outcome.ok) throw new Error(outcome.message);
    expect(applyFixes("a;", outcome.reports)).toBe("_a_;");
  });

  it("reports a fix that returns something else, or overlapping edits, as a rule error", () => {
    const rule = (fix: string) => `const rule = { meta: { fixable: "code" }, create(context) { return {
      Identifier(node) { context.report({ node, message: "x", fix: (fixer) => ${fix} }); },
    }; } };`;
    expect(runRule(rule(`({ range: [0, 1], text: "b" })`), "a;")).toMatchObject({ ok: false, where: "rule", message: /fixer/ });
    expect(runRule(rule(`[fixer.replaceText(node, "b"), fixer.remove(node)]`), "a;")).toMatchObject({ ok: false, where: "rule", message: /overlap/ });
  });

  it("looks up messageId in meta.messages", () => {
    const rule = (messages: string) => `const rule = { meta: { messages: ${messages} }, create(context) { return {
      Identifier(node) { context.report({ node, messageId: "named", data: { name: node.name } }); },
    }; } };`;
    expect(runRule(rule(`{ named: "Found {{ name }}." }`), "a")).toMatchObject({ ok: true, reports: [{ message: "Found a." }] });
    expect(runRule(rule("{}"), "a")).toMatchObject({ ok: false, where: "rule" });
  });

  it("treats a fix without edits as no fix", () => {
    const rule = `const rule = { meta: { fixable: "code" }, create(context) { return {
      Identifier(node) { context.report({ node, message: "x", fix: () => [] }); },
    }; } };`;
    const outcome = runRule(rule, "a; b;");
    if (!outcome.ok) throw new Error(outcome.message);
    expect(outcome.reports.map((report) => report.fix)).toEqual([undefined, undefined]);
    expect(applyFixes("a; b;", outcome.reports)).toBe("a; b;");
  });

  it("reports mistakes in the rule and in the code separately", () => {
    expect(runRule("const rule = {};", "a")).toMatchObject({ ok: false, where: "rule" });
    expect(runRule("const rule = { create() { return { Identifier(n) { n.x.y; } }; } };", "a")).toMatchObject({ ok: false, where: "rule" });
    expect(runRule(preset("no-var"), "var = ;")).toMatchObject({ ok: false, where: "code" });
  });
});
