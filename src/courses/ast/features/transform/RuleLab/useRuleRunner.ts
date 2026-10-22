import { useEffect, useRef, useState } from "react";
import type { RuleOutcome } from "@/courses/ast/engine/transform/ruleRunner";
import type { RuleRequest } from "@/courses/ast/engine/transform/ruleWorker";

/** Long enough for any honest rule on lesson-sized code. */
const TIME_LIMIT_MS = 1000;

const startWorker = () =>
  new Worker(new URL("../../../engine/transform/ruleWorker.ts", import.meta.url), { type: "module" });

/**
 * Runs the rule in a worker and returns the latest outcome, along with the
 * code it was run on (so fixes are applied to the same text). A rule that
 * takes too long is stopped and reported as a rule error.
 */
export function useRuleRunner(rule: string, code: string): { outcome: RuleOutcome; code: string } | null {
  const [latest, setLatest] = useState<{ outcome: RuleOutcome; code: string } | null>(null);
  const worker = useRef<Worker | null>(null);
  const nextId = useRef(0);

  useEffect(() => () => worker.current?.terminate(), []);

  useEffect(() => {
    worker.current ??= startWorker();
    const running = worker.current;
    const id = ++nextId.current;
    let done = false;
    const stop = () => {
      // The only way to stop a running loop is to stop its worker.
      running.terminate();
      if (worker.current === running) worker.current = null;
    };
    const finish = (outcome: RuleOutcome) => {
      done = true;
      clearTimeout(timer);
      running.removeEventListener("message", onMessage);
      setLatest({ outcome, code });
    };
    const onMessage = ({ data }: MessageEvent<{ id: number; outcome: RuleOutcome }>) => {
      if (data.id === id) finish(data.outcome);
    };
    const timer = setTimeout(() => {
      stop();
      finish({
        ok: false,
        where: "rule",
        message: `it was still running after ${TIME_LIMIT_MS / 1000} second, so it was stopped. Is there a loop that never ends?`,
      });
    }, TIME_LIMIT_MS);
    running.addEventListener("message", onMessage);
    running.postMessage({ id, rule, code } satisfies RuleRequest);
    return () => {
      clearTimeout(timer);
      running.removeEventListener("message", onMessage);
      // Still busy with this rule: it may never finish, and the next run would queue behind it.
      if (!done) stop();
    };
  }, [rule, code]);

  return latest;
}
