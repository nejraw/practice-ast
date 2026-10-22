import { useCallback, useSyncExternalStore } from "react";
import type { Course } from "@/features/course";

/**
 * Which lessons the reader has finished, kept in this browser only. A lesson
 * counts as finished once the reader reaches its takeaway.
 */

// Prefixed with the topic: courses in the series hosted on one domain share storage.
const storageKey = (course: Course) => `practice-${course.topic}:finished`;
const CHANGED = "practice:progress";

function read(key: string): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(value) ? value.filter((slug) => typeof slug === "string") : [];
  } catch {
    // Storage can be blocked or hold something else; start from nothing.
    return [];
  }
}

// useSyncExternalStore needs the same array back until something changes.
const cache = new Map<string, { raw: string | null; finished: string[] }>();

// Progress that couldn't be saved, so it still lasts until the page reloads.
const unsaved = new Map<string, string[]>();

function snapshot(key: string): string[] {
  const pending = unsaved.get(key);
  if (pending) return pending;
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key);
  } catch {
    // Blocked storage, and nothing finished yet in this page.
  }
  const cached = cache.get(key);
  if (cached && cached.raw === raw) return cached.finished;
  const finished = read(key);
  cache.set(key, { raw, finished });
  return finished;
}

function write(key: string, finished: string[]) {
  try {
    if (finished.length) localStorage.setItem(key, JSON.stringify(finished));
    else localStorage.removeItem(key);
    unsaved.delete(key);
  } catch {
    // Without storage, progress lasts until the page reloads.
    unsaved.set(key, finished);
  }
  window.dispatchEvent(new Event(CHANGED));
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGED, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGED, onChange);
    window.removeEventListener("storage", onChange);
  };
}

// Prerendered pages know nothing of the reader's progress. The same array every
// time, as useSyncExternalStore requires.
const NONE_FINISHED: string[] = [];

export function useFinishedLessons(course: Course): string[] {
  const key = storageKey(course);
  const getSnapshot = useCallback(() => snapshot(key), [key]);
  return useSyncExternalStore(subscribe, getSnapshot, () => NONE_FINISHED);
}

export function markFinished(course: Course, slug: string) {
  const key = storageKey(course);
  const finished = snapshot(key);
  if (!finished.includes(slug)) write(key, [...finished, slug]);
}

export function resetProgress(course: Course) {
  write(storageKey(course), []);
}
