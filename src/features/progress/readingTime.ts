/**
 * How long a lesson takes, estimated from its MDX source: reading the prose,
 * reading the code, trying the figures and thinking about the check. "Going
 * deeper" sections are optional, so they are counted separately.
 *
 * Runs at build time (see the lesson-times plugin in vite.config.ts), so the
 * lesson text itself doesn't have to ship with the sidebar.
 */

/** Technical prose reads slower than a novel. */
const PROSE_WORDS_PER_MINUTE = 200;
/** Code is read token by token. */
const CODE_WORDS_PER_MINUTE = 60;
/** Minutes for a figure: most take a minute or two of trying things. */
const FIGURE_MINUTES = 1.5;
/** Time to think before revealing a check's answer. */
const CHECK_MINUTES = 0.5;

/** Components that are part of the text, not figures to try. */
const NOT_FIGURES = new Set(["Aside", "Check", "Cite", "Deeper"]);

export interface LessonTime {
  /** The main path, in whole minutes. */
  minutes: number;
  /** The optional "Going deeper" material, in whole minutes (0 if there is none). */
  deeperMinutes: number;
}

/** Minutes per figure, by component name, for figures that take longer than FIGURE_MINUTES. */
export type LabMinutes = Record<string, number>;

function estimate(text: string, labMinutes: LabMinutes): number {
  let minutes = 0;
  for (const [, name] of text.matchAll(/<([A-Z]\w*)/g)) {
    if (name === "Check") minutes += CHECK_MINUTES;
    else if (!NOT_FIGURES.has(name)) minutes += labMinutes[name] ?? FIGURE_MINUTES;
  }
  const codeBlocks = [...text.matchAll(/```[\s\S]*?```/g)].map((match) => match[0]);
  const codeWords = codeBlocks.join(" ").split(/\s+/).filter(Boolean).length;
  const prose = text.replace(/```[\s\S]*?```/g, " ").replace(/<[^>]*>/g, " ");
  const proseWords = prose.split(/\s+/).filter(Boolean).length;
  return minutes + proseWords / PROSE_WORDS_PER_MINUTE + codeWords / CODE_WORDS_PER_MINUTE;
}

export function estimateLessonTime(mdx: string, labMinutes: LabMinutes = {}): LessonTime {
  const text = mdx.replace(/^import .*$/gm, "");
  const deeper = [...text.matchAll(/<Deeper[^>]*>([\s\S]*?)<\/Deeper>/g)].map((match) => match[1]).join("\n");
  const main = text.replace(/<Deeper[^>]*>[\s\S]*?<\/Deeper>/g, "");
  return {
    minutes: Math.max(1, Math.round(estimate(main, labMinutes))),
    deeperMinutes: deeper.trim() ? Math.max(1, Math.round(estimate(deeper, labMinutes))) : 0,
  };
}
