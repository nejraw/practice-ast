import { useDeferredValue, useMemo, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { grammar, miniParse, ruleSpans, type Rule, type RuleSpan, type Token } from "@/courses/ast/engine/parsing/miniParser";
import { shared } from "@/design/shared.styles";
import { CodeEditor, type Highlight } from "@/features/editor/CodeEditor";
import { Button } from "@/design/components/Button";
import { Figure } from "@/features/lesson/Figure";
import { border, styles, swatch, text } from "./GrammarBoxes.styles";

const PLAIN: Record<Rule, string> = {
  expression: "terms, joined by + or -",
  term: "factors, joined by *, / or %",
  factor: "a number, a name, or a whole expression in ( )",
};

/** A span plus the rules that matched exactly the same tokens (e.g. `a` is a factor, a term and an expression). */
interface Box {
  rules: Rule[];
  span: RuleSpan;
}

function collapse(span: RuleSpan): Box {
  const rules: Rule[] = [span.rule];
  let inner = span;
  while (inner.children.length === 1 && inner.children[0].start === span.start && inner.children[0].end === span.end) {
    inner = inner.children[0];
    rules.push(inner.rule);
  }
  return { rules, span: inner };
}

/** Shows which grammar rule matched which tokens, as boxes inside boxes. */
export function GrammarBoxes({
  code: initialCode,
  presets,
  title = "How the code fits the rules",
}: {
  code: string;
  presets?: string[];
  title?: string;
}) {
  const [code, setCode] = useState(initialCode);
  const [hovered, setHovered] = useState<Box | null>(null);
  const deferred = useDeferredValue(code);
  const parse = useMemo(() => miniParse(deferred), [deferred]);
  const root = useMemo(() => ruleSpans(parse), [parse]);
  const last = parse.steps.at(-1);
  // "factor() expected )" reads as "the factor rule expected )": functions come later in the lesson.
  const error = last?.kind === "error" ? last.message.replace(/(\w+)\(\)/g, "the $1 rule") : null;

  const tokenRange = (box: Box) => ({
    start: parse.tokens[box.span.start]?.start ?? 0,
    end: parse.tokens[box.span.end - 1]?.end ?? 0,
  });
  const highlights: Highlight[] = hovered ? [{ ...tokenRange(hovered), tone: "focus" }] : [];

  const renderBox = (box: Box, depth: number) => {
    const { span } = box;
    const items: Array<{ token: Token } | { child: RuleSpan }> = [];
    let at = span.start;
    for (const child of span.children) {
      while (at < child.start) items.push({ token: parse.tokens[at++] });
      items.push({ child });
      at = child.end;
    }
    while (at < span.end) items.push({ token: parse.tokens[at++] });
    const ruleColor = border[box.rules[0]];

    return (
      <span
        key={`${span.start}-${span.end}-${depth}`}
        // Focus and tap do what hover does, for keyboards and touch screens. The
        // innermost box wins: boxes are nested, so the event stops at the first one.
        tabIndex={0}
        onMouseEnter={(event) => {
          event.stopPropagation();
          setHovered(box);
        }}
        onFocus={(event) => {
          event.stopPropagation();
          setHovered(box);
        }}
        onClick={(event) => {
          event.stopPropagation();
          setHovered(box);
        }}
        {...stylex.props(styles.box, ruleColor, hovered?.span === span && styles.boxHovered)}
      >
        <span {...stylex.props(styles.boxLabel)}>
          {box.rules.map((rule, i) => (
            <span key={rule}>
              {i > 0 && <span {...stylex.props(styles.labelJoin)}> = </span>}
              <span {...stylex.props(text[rule])}>{rule}</span>
            </span>
          ))}
        </span>
        <span {...stylex.props(styles.boxBody)}>
          {items.map((item) =>
            "token" in item ? (
              <span key={`t${item.token.start}`} {...stylex.props(styles.token)}>
                {item.token.text}
              </span>
            ) : (
              renderBox(collapse(item.child), depth + 1)
            ),
          )}
        </span>
      </span>
    );
  };

  return (
    <Figure title={title}>
      {presets && (
        <div {...stylex.props(styles.presets)}>
          {presets.map((preset) => (
            <Button key={preset} onClick={() => setCode(preset)} active={preset === code}>
              <code>{preset}</code>
            </Button>
          ))}
        </div>
      )}
      <CodeEditor value={code} onChange={setCode} compact highlights={highlights} ariaLabel="Expression to match" />

      <ul {...stylex.props(styles.rules)}>
        {grammar.map((line) => (
          <li key={line.rule} {...stylex.props(styles.rule, hovered?.rules.includes(line.rule) && styles.ruleHovered)}>
            <span {...stylex.props(styles.swatch, swatch[line.rule])} />
            <span {...stylex.props(styles.ruleName, text[line.rule])}>{line.rule}</span>
            <span {...stylex.props(styles.ruleMeaning)}>is made of {PLAIN[line.rule]}</span>
          </li>
        ))}
      </ul>

      <div {...stylex.props(styles.canvas)} onMouseLeave={() => setHovered(null)} onBlur={() => setHovered(null)}>
        {root ? renderBox(collapse(root), 0) : <p {...stylex.props(styles.problem)}>{error ?? "Type an expression."}</p>}
      </div>
      <p {...stylex.props(shared.caption, styles.hint)}>Hover or tap a box to see its tokens and its rule.</p>
    </Figure>
  );
}
