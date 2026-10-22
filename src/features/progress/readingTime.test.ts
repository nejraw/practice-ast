import { describe, expect, it } from "vitest";
import { estimateLessonTime } from "./readingTime";

describe("estimateLessonTime", () => {
  it("reads 200 words of prose in a minute", () => {
    expect(estimateLessonTime("word ".repeat(400))).toEqual({ minutes: 2, deeperMinutes: 0 });
  });

  it("adds time for figures and checks, but not for asides or citations", () => {
    const text = `Some text.<Cite id="x" />\n\n<Aside>A note.</Aside>\n\n<ExpressionTree code="a" />\n\n<RuleLab />\n\n<Check question="q">a</Check>`;
    // 1.5 for the figure, 4 for the lab, 0.5 for the check, and a few words.
    expect(estimateLessonTime(text, { RuleLab: 4 }).minutes).toBe(6);
  });

  it("counts Going deeper separately", () => {
    const text = `${"word ".repeat(200)}\n<Deeper about="x">\n${"word ".repeat(400)}\n</Deeper>`;
    expect(estimateLessonTime(text)).toEqual({ minutes: 1, deeperMinutes: 2 });
  });
});
