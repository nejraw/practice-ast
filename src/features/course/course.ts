import type { LinkProps } from "@tanstack/react-router";
import type { MDXContent } from "mdx/types";
import type { LessonTime } from "@/features/progress/readingTime";

/**
 * What a course in the practice(<topic>) series gives the platform. The
 * platform (lesson pages, navigation, progress) only knows a course through
 * this, so a new course is a new folder under src/courses.
 */
export interface Course {
  /** The topic in the series mark, practice(<topic>). */
  topic: string;
  /** The full name, used in page titles: "ASTs in Practice". */
  title: string;
  /** A short line under the series mark. */
  tagline: string;
  /** One or two sentences for search results and link previews. */
  description: string;
  /** The top of the contents page. */
  intro: { heading: string; lead: string };
  lessons: Lesson[];
  /** Sources per lesson, keyed by slug, in the order they are numbered. */
  sources: Record<string, Source[]>;
  /** Estimated time per lesson, keyed by slug (see the lesson-times plugin). */
  times: Record<string, LessonTime>;
  /** Pages outside the lessons, such as an interactive tool. */
  tools: Tool[];
  /** Loads a lesson's text, or nothing if the lesson isn't written yet. */
  loadLesson(slug: string): LessonContent | undefined;
}

export interface Lesson {
  slug: string;
  number: number;
  title: string;
  goal: string;
}

export type LessonContent = () => Promise<{ default: MDXContent }>;

export interface Source {
  /** Stable key, used by `<Cite id="…" />` in the lesson text. */
  id: string;
  title: string;
  /** Author(s), or the organisation behind the page. */
  by: string;
  /** Where it was published, e.g. "V8 blog". */
  publication: string;
  year?: number;
  url: string;
  /** What the lesson relies on this source for. */
  usedFor: string;
}

export interface Tool {
  /** Shown where a lesson shows its number: "A". */
  mark: string;
  to: LinkProps["to"];
  /** Short, for the sidebar: "Explorer". */
  name: string;
  /** Full, for the contents page: "The Explorer". */
  title: string;
  description: string;
}

/** Numbers lessons in the order they're listed, from 1. */
export function numberLessons(lessons: Omit<Lesson, "number">[]): Lesson[] {
  return lessons.map((lesson, i) => ({ ...lesson, number: i + 1 }));
}

export function findLesson(course: Course, slug: string): Lesson | undefined {
  return course.lessons.find((lesson) => lesson.slug === slug);
}

/** Lesson numbers are shown zero-padded, like numbered files: "01", "02". */
export function padNumber(n: number): string {
  return String(n).padStart(2, "0");
}
