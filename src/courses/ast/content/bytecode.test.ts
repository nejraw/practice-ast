import { describe, expect, it } from "vitest";
import { parseProgram } from "@/courses/ast/engine/parsing/parse";
import { walk } from "@/courses/ast/engine/tree/walk";
import { bytecodeExamples } from "./bytecode";

describe("bytecode examples", () => {
  for (const [name, example] of Object.entries(bytecodeExamples)) {
    it(`${name}: every instruction points at a real node`, () => {
      const result = parseProgram(example.code);
      if (!result.ok) throw new Error(result.message);
      const ranges = new Set<string>();
      walk(result.ast, (node) => void ranges.add(`${node.start}-${node.end}`));
      for (const line of example.lines) expect(ranges).toContain(line.range.join("-"));
    });

    it(`${name}: offsets follow from the byte counts`, () => {
      example.lines.forEach((line, i) => {
        const next = example.lines[i + 1];
        if (next) expect(next.offset).toBe(line.offset + line.bytes.split(" ").length);
      });
    });

    it(`${name}: jumps land on an instruction`, () => {
      const offsets = example.lines.map((line) => line.offset);
      for (const line of example.lines) if (line.jumpTo !== undefined) expect(offsets).toContain(line.jumpTo);
    });
  }
});
