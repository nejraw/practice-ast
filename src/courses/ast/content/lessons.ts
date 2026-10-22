import { numberLessons, type LessonContent } from "@/features/course";

export const lessons = numberLessons([
  {
    slug: "what-is-an-ast",
    title: "What is an AST?",
    goal: "Understand that code is just text to a computer, and that an AST is the structure hidden inside that text.",
  },
  {
    slug: "why-its-needed",
    title: "Why it's needed",
    goal: "Understand that building a tree is not optional: the engine needs it to run your code, and every tool needs it to understand your code.",
  },
  {
    slug: "tokenizing",
    title: "Tokenizing",
    goal: "Understand how characters become tokens, and why this is harder in JavaScript than it looks.",
  },
  {
    slug: "parsing",
    title: "Parsing",
    goal: "Understand how grammar rules turn tokens into a tree, and where JavaScript's grammar gets ambiguous.",
  },
  {
    slug: "tree-to-running-code",
    title: "From tree to running code",
    goal: "Understand what the engine does with the AST.",
  },
  {
    slug: "scope-and-bindings",
    title: "Scope and bindings",
    goal: "Understand what the AST does not know, and how tools add meaning on top of it.",
  },
  {
    slug: "transforming-code",
    title: "Transforming code",
    goal: "Understand how tools change code: code → AST → modified AST → code.",
  },
  {
    slug: "build-your-own",
    title: "Build your own",
    goal: "Apply everything by writing tools for your own codebase.",
  },
  {
    slug: "ast-landscape",
    title: "The AST landscape",
    goal: "Understand the ecosystem of parsers and formats.",
  },
]);

// Lesson files are named "<slug>.mdx". Lessons without a file are shown as "coming soon".
const contentModules = import.meta.glob<Awaited<ReturnType<LessonContent>>>("./lessons/*.mdx");

export function lessonContentLoader(slug: string): LessonContent | undefined {
  return contentModules[`./lessons/${slug}.mdx`];
}
