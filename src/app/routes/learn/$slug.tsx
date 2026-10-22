import { createFileRoute, notFound } from "@tanstack/react-router";
import { course } from "@/app/course";
import { findLesson } from "@/features/course";
import { LessonPage } from "@/features/lesson/LessonPage";
import { preloadLessonContent } from "@/features/lesson/lessonContent";

export const Route = createFileRoute("/learn/$slug")({
  loader: async ({ params }) => {
    const lesson = findLesson(course, params.slug);
    if (!lesson) throw notFound();
    await preloadLessonContent(course, lesson.slug);
    return lesson;
  },
  // Without a lesson (not found), the root route's title and description stay.
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} · ${course.title}` },
          { name: "description", content: loaderData.goal },
        ]
      : [],
  }),
  component: LessonRoute,
});

function LessonRoute() {
  const lesson = Route.useLoaderData();
  return <LessonPage key={lesson.slug} lesson={lesson} />;
}
