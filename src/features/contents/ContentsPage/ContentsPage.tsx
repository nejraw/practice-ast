import * as stylex from "@stylexjs/stylex";
import { Link } from "@tanstack/react-router";
import { shared } from "@/design/shared.styles";
import { padNumber, useCourse } from "@/features/course";
import { formatMinutes, lessonTime, totalMinutes } from "@/features/progress/lessonTimes";
import { useFinishedLessons } from "@/features/progress/useProgress";
import { styles } from "./ContentsPage.styles";

const WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];

/** Small counts read better as words: "nine lessons". */
function inWords(n: number): string {
  return WORDS[n] ?? String(n);
}

/** The title page: what the course is about, and its lessons and tools. */
export function ContentsPage() {
  const course = useCourse();
  const { lessons } = course;
  const finished = useFinishedLessons(course);
  return (
    <div {...stylex.props(styles.page)}>
      <header {...stylex.props(styles.titleBlock)}>
        <p {...stylex.props(styles.comment)}>// a short course in {inWords(lessons.length)} lessons, about {formatMinutes(totalMinutes(course))} in all</p>
        <h1 {...stylex.props(styles.title)}>
          {course.intro.heading}
          <span {...stylex.props(styles.semicolon)}>;</span>
        </h1>
        <p {...stylex.props(styles.lead)}>{course.intro.lead}</p>
        <Link to="/learn/$slug" params={{ slug: lessons[0].slug }} {...stylex.props(styles.start)}>
          start(<span {...stylex.props(styles.arg)}>"{lessons[0].slug}"</span>) →
        </Link>
      </header>

      <section aria-labelledby="contents">
        <h2 id="contents" {...stylex.props(shared.caption, styles.contentsHeading)}>
          lessons/
        </h2>
        <ol {...stylex.props(styles.contents)}>
          {lessons.map((lesson) => (
            <li key={lesson.slug}>
              <Link to="/learn/$slug" params={{ slug: lesson.slug }} {...stylex.props(styles.entry)}>
                <span {...stylex.props(styles.entryNumber)}>{padNumber(lesson.number)}</span>
                <span {...stylex.props(styles.entryText)}>
                  <span {...stylex.props(styles.entryTitle)}>{lesson.title}</span>
                  <span {...stylex.props(styles.entryGoal)}>{lesson.goal}</span>
                  <span {...stylex.props(styles.entryTime)}>
                    about {formatMinutes(lessonTime(course, lesson.slug).minutes)}
                    {finished.includes(lesson.slug) && <span {...stylex.props(styles.entryFinished)}> · finished ✓</span>}
                  </span>
                </span>
              </Link>
            </li>
          ))}
          {course.tools.map((tool) => (
            <li key={tool.mark}>
              <Link to={tool.to} {...stylex.props(styles.entry)}>
                <span {...stylex.props(styles.entryNumber)}>{tool.mark}</span>
                <span {...stylex.props(styles.entryText)}>
                  <span {...stylex.props(styles.entryTitle)}>{tool.title}</span>
                  <span {...stylex.props(styles.entryGoal)}>{tool.description}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
