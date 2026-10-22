import * as stylex from "@stylexjs/stylex";
import { Link } from "@tanstack/react-router";
import { BrandMark } from "@/design/components/BrandMark";
import { shared } from "@/design/shared.styles";
import { padNumber, useCourse } from "@/features/course";
import { formatMinutes, lessonTime, totalMinutes } from "@/features/progress/lessonTimes";
import { resetProgress, useFinishedLessons } from "@/features/progress/useProgress";
import { ThemeToggle } from "@/features/theme/ThemeToggle";
import { styles } from "./Sidebar.styles";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const course = useCourse();
  const { lessons } = course;
  const finishedSlugs = useFinishedLessons(course);
  const finished = lessons.filter((lesson) => finishedSlugs.includes(lesson.slug));
  const left = totalMinutes(course) - totalMinutes(course, finished);

  return (
    <nav aria-label="Course" {...stylex.props(styles.nav)}>
      <Link to="/" onClick={onNavigate} aria-label={`${course.title}, contents`} {...stylex.props(styles.brand)}>
        <BrandMark topic={course.topic} large />
        <span {...stylex.props(styles.brandSubtitle)}>// {course.tagline}</span>
      </Link>

      <p {...stylex.props(shared.caption, styles.heading)}>lessons/</p>
      <div {...stylex.props(styles.progress)}>
        <div
          role="progressbar"
          aria-label="Lessons finished"
          aria-valuemin={0}
          aria-valuemax={lessons.length}
          aria-valuenow={finished.length}
          {...stylex.props(styles.track)}
        >
          <div {...stylex.props(styles.fill)} style={{ width: `${(finished.length / lessons.length) * 100}%` }} />
        </div>
        <p {...stylex.props(styles.progressText)}>
          {finished.length === lessons.length ? (
            <>all {lessons.length} finished ✓</>
          ) : (
            <>
              {finished.length}/{lessons.length} finished · about {formatMinutes(left)} to go
            </>
          )}
          {finished.length > 0 && (
            <button type="button" onClick={() => resetProgress(course)} {...stylex.props(styles.reset)}>
              reset
            </button>
          )}
        </p>
      </div>
      <ol {...stylex.props(styles.list)}>
        {lessons.map((lesson) => {
          const isFinished = finishedSlugs.includes(lesson.slug);
          return (
            <li key={lesson.slug} aria-label={isFinished ? `${lesson.title}, finished` : undefined}>
              <Link to="/learn/$slug" params={{ slug: lesson.slug }} onClick={onNavigate} {...stylex.props(styles.linkReset)}>
                {({ isActive }) => (
                  <span {...stylex.props(styles.entry, isActive && styles.active)}>
                    <span {...stylex.props(styles.number, isActive && styles.activeNumber, isFinished && !isActive && styles.finishedNumber)}>
                      {isActive ? "▸" : isFinished ? "✓" : " "}
                      {padNumber(lesson.number)}
                    </span>
                    <span {...stylex.props(styles.title)}>{lesson.title}</span>
                    <span {...stylex.props(styles.minutes)}>{lessonTime(course, lesson.slug).minutes}′</span>
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ol>

      <p {...stylex.props(shared.caption, styles.heading)}>tools/</p>
      {course.tools.map((tool) => (
        <Link key={tool.mark} to={tool.to} onClick={onNavigate} {...stylex.props(styles.linkReset)}>
          {({ isActive }) => (
            <span {...stylex.props(styles.entry, isActive && styles.active)}>
              <span {...stylex.props(styles.number, isActive && styles.activeNumber)}>
                {isActive ? "▸" : " "}
                {tool.mark}
              </span>
              <span {...stylex.props(styles.title)}>{tool.name}</span>
            </span>
          )}
        </Link>
      ))}

      <p {...stylex.props(shared.caption, styles.heading)}>theme/</p>
      <ThemeToggle />
    </nav>
  );
}
