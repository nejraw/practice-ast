import { describe, expect, it } from "vitest";
import { lessonContentLoader, lessons } from "./lessons";
import { sources } from "./sources";

const written = lessons.filter((lesson) => lessonContentLoader(lesson.slug));

const lessonTexts = import.meta.glob<string>("./lessons/*.mdx", { query: "?raw", import: "default", eager: true });

function citedIds(slug: string) {
  const text = lessonTexts[`./lessons/${slug}.mdx`];
  return [...text.matchAll(/<Cite id="([^"]+)"/g)].map((match) => match[1]);
}

describe("sources", () => {
  it("are listed for every written lesson", () => {
    expect(written.filter((lesson) => !sources[lesson.slug]?.length).map((lesson) => lesson.slug)).toEqual([]);
  });

  it("belong to lessons that exist", () => {
    const slugs = new Set(lessons.map((lesson) => lesson.slug));
    expect(Object.keys(sources).filter((slug) => !slugs.has(slug))).toEqual([]);
  });

  it("are each cited in the lesson text, and every citation is listed", () => {
    for (const lesson of written) {
      const listed = (sources[lesson.slug] ?? []).map((source) => source.id);
      const cited = new Set(citedIds(lesson.slug));
      expect({ lesson: lesson.slug, uncited: listed.filter((id) => !cited.has(id)) }).toEqual({ lesson: lesson.slug, uncited: [] });
      expect({ lesson: lesson.slug, unlisted: [...cited].filter((id) => !listed.includes(id)) }).toEqual({ lesson: lesson.slug, unlisted: [] });
    }
  });

  it("have unique ids, https links and say what they are used for", () => {
    for (const items of Object.values(sources)) {
      expect(new Set(items.map((source) => source.id)).size).toBe(items.length);
      for (const source of items) {
        expect(source.url).toMatch(/^https:\/\//);
        expect(source.usedFor.length).toBeGreaterThan(0);
      }
    }
  });
});
