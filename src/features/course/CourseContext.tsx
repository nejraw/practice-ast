import { createContext, useContext, type ReactNode } from "react";
import type { Course } from "./course";

const CourseContext = createContext<Course | null>(null);

/** Makes the course available to every platform component below it. */
export function CourseProvider({ course, children }: { course: Course; children: ReactNode }) {
  return <CourseContext.Provider value={course}>{children}</CourseContext.Provider>;
}

export function useCourse(): Course {
  const course = useContext(CourseContext);
  if (!course) throw new Error("useCourse needs a <CourseProvider> above it");
  return course;
}
