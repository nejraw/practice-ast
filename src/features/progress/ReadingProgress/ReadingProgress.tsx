import { useEffect, useState, type RefObject } from "react";
import * as stylex from "@stylexjs/stylex";
import { formatMinutes } from "@/features/progress/lessonTimes";
import { useCourse } from "@/features/course";
import { markFinished, useFinishedLessons } from "@/features/progress/useProgress";
import { styles } from "./ReadingProgress.styles";

interface Progress {
  /** How far through the main path, from 0 to 1. */
  main: number;
  /** Whether a "Going deeper" section is open, and how far through it. */
  deeperOpen: boolean;
  deeper: number;
}

/**
 * Where the reader is: a line that starts at the top of the screen and settles
 * halfway down as you scroll, so the bar starts empty and fills at the end.
 */
function readingLine() {
  const half = window.innerHeight / 2;
  return window.scrollY + half * Math.min(1, window.scrollY / half);
}

/** How far the reading line has got through an element, from 0 to 1. */
function through(top: number, bottom: number) {
  return bottom <= top ? 1 : Math.min(1, Math.max(0, (readingLine() - top) / (bottom - top)));
}

/**
 * Follows the reader through the main path and, separately, through the
 * optional "Going deeper" section, so opening it doesn't move the main bar.
 */
function useScrollProgress(target: RefObject<HTMLElement | null>): Progress {
  const [progress, setProgress] = useState<Progress>({ main: 0, deeperOpen: false, deeper: 0 });
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const article = target.current;
      if (!article) return;
      const pageTop = (element: Element) => element.getBoundingClientRect().top + window.scrollY;
      const pageBottom = (element: Element) => element.getBoundingClientRect().bottom + window.scrollY;
      const deeper = article.querySelector<HTMLDetailsElement>("details[data-deeper]");
      // The main path runs to the takeaway, just before "Going deeper" or the list of sources.
      const after = deeper ?? article.querySelector("[data-sources]");
      // Until the lesson has loaded, there's nothing to measure.
      if (!after) return;
      const mainEnd = pageTop(after);
      // At the very bottom of the page, everything on it has been seen.
      const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      const deeperOpen = !!deeper?.open;
      const next = {
        main: atBottom ? 1 : through(pageTop(article), mainEnd),
        deeperOpen,
        deeper: !deeper || !deeperOpen ? 0 : atBottom ? 1 : through(pageTop(deeper), pageBottom(deeper)),
      };
      setProgress((previous) =>
        previous.main === next.main && previous.deeper === next.deeper && previous.deeperOpen === next.deeperOpen ? previous : next,
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    // Lessons load lazily, figures change size, and "Going deeper" opens and closes.
    const article = target.current;
    const resize = new ResizeObserver(schedule);
    if (article) {
      resize.observe(article);
      article.addEventListener("toggle", schedule, true);
    }
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      resize.disconnect();
      article?.removeEventListener("toggle", schedule, true);
    };
  }, [target]);
  return progress;
}

/**
 * A thin bar at the top of a lesson: how far you are, and roughly how long is
 * left. While "Going deeper" is open, it gets a segment of its own.
 */
export function ReadingProgress({
  slug,
  minutes,
  deeperMinutes,
  article,
}: {
  slug: string;
  minutes: number;
  deeperMinutes: number;
  article: RefObject<HTMLElement | null>;
}) {
  const progress = useScrollProgress(article);
  const course = useCourse();
  const finished = useFinishedLessons(course).includes(slug);
  // Reaching the takeaway finishes a lesson; "Going deeper" is optional.
  useEffect(() => {
    if (progress.main === 1) markFinished(course, slug);
  }, [course, progress.main, slug]);
  const mainLeft = Math.ceil(minutes * (1 - progress.main));
  const showDeeper = progress.deeperOpen && deeperMinutes > 0;
  const deeperLeft = Math.ceil(deeperMinutes * (1 - progress.deeper));

  const readingDeeper = showDeeper && deeperLeft > 0;
  const showFinished = mainLeft <= 0 && !readingDeeper && finished;
  let label: string;
  if (mainLeft > 0) label = `about ${formatMinutes(mainLeft)} left`;
  else if (readingDeeper) label = `going deeper: about ${formatMinutes(deeperLeft)} left`;
  else label = finished ? "finished ✓" : "almost done";

  return (
    <div {...stylex.props(styles.bar)}>
      <div {...stylex.props(styles.tracks)}>
        <div
          role="progressbar"
          aria-label="Reading progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress.main * 100)}
          style={{ flexGrow: minutes }}
          {...stylex.props(styles.track)}
        >
          <div {...stylex.props(styles.fill)} style={{ transform: `scaleX(${progress.main})` }} />
        </div>
        {showDeeper && (
          <div
            role="progressbar"
            aria-label="Going deeper progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress.deeper * 100)}
            style={{ flexGrow: deeperMinutes }}
            {...stylex.props(styles.track)}
          >
            <div {...stylex.props(styles.fill, styles.deeperFill)} style={{ transform: `scaleX(${progress.deeper})` }} />
          </div>
        )}
      </div>
      <span {...stylex.props(styles.label, showFinished && styles.finished)}>{label}</span>
    </div>
  );
}
