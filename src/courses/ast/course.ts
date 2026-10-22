import times from "virtual:lesson-times";
import type { Course } from "@/features/course";
import { lessonContentLoader, lessons } from "./content/lessons";
import { sources } from "./content/sources";

/** practice(ast): how JavaScript tooling turns code into trees, and what it does with them. */
export const astCourse: Course = {
  topic: "ast",
  title: "ASTs in Practice",
  tagline: "everything starts with a tree",
  description:
    "A short, hands-on course on abstract syntax trees: how JavaScript engines and tools turn code into trees, " +
    "and how to put that to use.",
  intro: {
    heading: "Everything starts with a tree",
    lead:
      "Before a single line of JavaScript runs, the engine turns it into an abstract syntax tree. Every tool in " +
      "your toolchain does the same. These lessons show how that works, why it is needed, and how to put it to use.",
  },
  lessons,
  sources,
  times,
  tools: [
    {
      mark: "A",
      to: "/explorer",
      name: "Explorer",
      title: "The Explorer",
      description: "Write any JavaScript and inspect its full tree.",
    },
  ],
  loadLesson: lessonContentLoader,
};
