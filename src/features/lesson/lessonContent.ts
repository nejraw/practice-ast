import { lazy, type ComponentType } from "react";
import type { Course } from "@/features/course";

// Lessons whose content has been loaded, so they can render straight away. The
// route loader fills this before rendering, which puts the lesson text directly
// into the prerendered HTML instead of a streamed Suspense chunk.
const loadedContent = new Map<string, ComponentType>();

/** Loads a lesson's content ahead of rendering it. */
export async function preloadLessonContent(course: Course, slug: string) {
  const loader = course.loadLesson(slug);
  if (loader && !loadedContent.has(slug)) loadedContent.set(slug, (await loader()).default);
}

// One lazy component per lesson, created once so React keeps it between renders.
// Used when the content isn't loaded yet, such as while the page hydrates.
const lazyContent = new Map<string, ComponentType>();

/** The lesson's content as a component, or null if the lesson isn't written yet. */
export function lessonContent(course: Course, slug: string): ComponentType | null {
  const loaded = loadedContent.get(slug);
  if (loaded) return loaded;
  const loader = course.loadLesson(slug);
  if (!loader) return null;
  let component = lazyContent.get(slug);
  if (!component) {
    component = lazy(loader);
    lazyContent.set(slug, component);
  }
  return component;
}
