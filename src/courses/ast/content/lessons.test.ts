import { describe, expect, it } from "vitest";
import { estimateLessonTime } from "@/features/progress/readingTime";
import { labMinutes } from "./labMinutes";
import { lessons } from "./lessons";

const lessonTexts = import.meta.glob<string>("./lessons/*.mdx", { query: "?raw", import: "default", eager: true });

describe("lessons", () => {
  it("gives every lesson a main path of a few minutes to a quarter of an hour", () => {
    for (const lesson of lessons) {
      const { minutes } = estimateLessonTime(lessonTexts[`./lessons/${lesson.slug}.mdx`], labMinutes);
      expect({ lesson: lesson.slug, plausible: minutes >= 3 && minutes <= 15 }).toEqual({ lesson: lesson.slug, plausible: true });
    }
  });
});
