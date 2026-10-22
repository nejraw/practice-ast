import { runRule } from "./ruleRunner";

/**
 * Runs lint rules away from the page, so a rule that never finishes (a loop
 * that's half written, say) can be stopped without freezing the tab.
 * See useRuleRunner in the RuleLab figure.
 */

export interface RuleRequest {
  id: number;
  rule: string;
  code: string;
}

self.onmessage = ({ data }: MessageEvent<RuleRequest>) => {
  self.postMessage({ id: data.id, outcome: runRule(data.rule, data.code) });
};
