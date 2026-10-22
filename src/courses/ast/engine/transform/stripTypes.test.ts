import { stripTypeScriptTypes } from "node:module";
import { describe, expect, it } from "vitest";
import { typeStripPresets } from "@/courses/ast/content/examples";
import { stripTypes } from "./stripTypes";

describe("stripTypes", () => {
  for (const preset of typeStripPresets.filter((preset) => !preset.refused)) {
    it(`blanks the types out exactly like Node.js: ${preset.label}`, async () => {
      const outcome = await stripTypes(preset.code);
      expect(outcome.ok).toBe(true);
      if (outcome.ok) expect(outcome.blanked).toBe(stripTypeScriptTypes(preset.code));
    });
  }

  for (const preset of typeStripPresets.filter((preset) => preset.refused)) {
    it(`refuses what Node.js refuses: ${preset.label}`, async () => {
      expect(() => stripTypeScriptTypes(preset.code)).toThrow();
      expect((await stripTypes(preset.code)).ok).toBe(false);
    });
  }

  for (const code of [
    "abstract class Shape {\n  abstract area: number;\n  abstract get name(): string;\n}",
    "function show(this: Window, label: string) {}",
    "function only(this: Window) {}",
  ]) {
    it(`blanks the types out exactly like Node.js: ${code.split("\n")[0]}`, async () => {
      const outcome = await stripTypes(code);
      if (!outcome.ok) throw new Error(outcome.message);
      expect(outcome.blanked).toBe(stripTypeScriptTypes(code));
    });
  }

  it("maps every character of the removed version back to the same character in the source", async () => {
    const code = typeStripPresets[0].code;
    const outcome = await stripTypes(code);
    if (!outcome.ok) throw new Error(outcome.message);
    [...outcome.removed].forEach((char, i) => expect(code[outcome.removedToSource[i]]).toBe(char));
    expect(outcome.removed).not.toContain("interface");
    expect(outcome.removed.length).toBeLessThan(code.length);
  });
});
