import { Suspense, useRef } from "react";
import * as stylex from "@stylexjs/stylex";
import { MDXProvider } from "@mdx-js/react";
import { Link } from "@tanstack/react-router";
import { Loader } from "@/design/components/Loader";
import { shared } from "@/design/shared.styles";
import { padNumber, useCourse, type Lesson } from "@/features/course";
import { lessonContent } from "@/features/lesson/lessonContent";
import { SourcesContext } from "@/features/lesson/SourcesContext";
import { mdxComponents } from "@/features/lesson/mdx/mdxComponents";
import { Sources } from "@/features/lesson/Sources";
import { formatMinutes, lessonTime } from "@/features/progress/lessonTimes";
import { ReadingProgress } from "@/features/progress/ReadingProgress";
import { styles } from "./LessonPage.styles";

export function LessonPage({ lesson }: { lesson: Lesson }) {
  const course = useCourse();
  const Content = lessonContent(course, lesson.slug);
  const previous = course.lessons[lesson.number - 2];
  const next = course.lessons[lesson.number];
  const lessonSources = course.sources[lesson.slug] ?? [];
  const time = lessonTime(course, lesson.slug);
  const article = useRef<HTMLElement>(null);

  return (
    // Section and figure numbers ("2.1", "Fig. 2.3") come from CSS counters seeded here.
    <article ref={article} {...stylex.props(styles.page)} style={{ counterReset: `lesson ${lesson.number} section figure` }}>
      <header {...stylex.props(styles.header)}>
        <p {...stylex.props(shared.caption, styles.eyebrow)}>
          lesson <span {...stylex.props(styles.accent)}>{padNumber(lesson.number)}</span> /{" "}
          {padNumber(course.lessons.length)}
          {time.minutes > 0 && (
            <>
              {" · "}
              <span title="Estimated time for the main path">about {formatMinutes(time.minutes)}</span>
              {time.deeperMinutes > 0 && ` · +${formatMinutes(time.deeperMinutes)} going deeper`}
            </>
          )}
        </p>
        <h1 {...stylex.props(styles.title)}>{lesson.title}</h1>

        {/* The goal, written the way you'd document a function. */}
        <div {...stylex.props(styles.docComment)}>
          <span aria-hidden>/**</span>
          <p {...stylex.props(styles.docBody)}>
            <span {...stylex.props(styles.docTag)}>@goal</span> {lesson.goal}
          </p>
          <span aria-hidden> */</span>
        </div>
      </header>

      {Content && time.minutes > 0 && <ReadingProgress slug={lesson.slug} minutes={time.minutes} deeperMinutes={time.deeperMinutes} article={article} />}

      {Content ? (
        <SourcesContext.Provider value={lessonSources}>
          <MDXProvider components={mdxComponents}>
            <Suspense fallback={<Loader label="parsing the lesson…" />}>
              <Content />
              {lessonSources.length > 0 && <Sources items={lessonSources} />}
            </Suspense>
          </MDXProvider>
        </SourcesContext.Provider>
      ) : (
        <p {...stylex.props(styles.muted)}>
          <code>// TODO:</code> this lesson is still being written.
        </p>
      )}

      <nav aria-label="Lesson navigation" {...stylex.props(styles.pager)}>
        {previous ? (
          <Link to="/learn/$slug" params={{ slug: previous.slug }} {...stylex.props(styles.pagerLink)}>
            <span {...stylex.props(styles.pagerCall)}>← prev()</span>
            <span>
              <span {...stylex.props(styles.pagerNumber)}>{padNumber(previous.number)}</span> {previous.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to="/learn/$slug" params={{ slug: next.slug }} {...stylex.props(styles.pagerLink, styles.pagerNext)}>
            <span {...stylex.props(styles.pagerCall)}>next() →</span>
            <span>
              <span {...stylex.props(styles.pagerNumber)}>{padNumber(next.number)}</span> {next.title}
            </span>
          </Link>
        )}
      </nav>
    </article>
  );
}
