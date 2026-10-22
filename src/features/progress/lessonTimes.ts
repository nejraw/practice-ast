import type { Course } from "@/features/course";
import type { LessonTime } from "./readingTime";

/** Estimated time for a lesson, computed from its text at build time. */
export function lessonTime(course: Course, slug: string): LessonTime {
  return course.times[slug] ?? { minutes: 0, deeperMinutes: 0 };
}

/** The main path of every lesson, in minutes. */
export function totalMinutes(course: Course, lessons = course.lessons): number {
  return lessons.reduce((sum, lesson) => sum + lessonTime(course, lesson.slug).minutes, 0);
}

/** "8 min", or "1 h 20 min" for longer stretches. */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const rest = minutes % 60;
  return rest ? `${Math.floor(minutes / 60)} h ${rest} min` : `${minutes / 60} h`;
}
