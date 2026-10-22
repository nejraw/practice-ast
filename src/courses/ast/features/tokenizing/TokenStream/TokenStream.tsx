import { useDeferredValue, useMemo, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { tokenize, tokensOf, type Piece, type TokenCategory } from "@/courses/ast/engine/parsing/tokens";
import { shared } from "@/design/shared.styles";
import { CodeEditor, type Highlight } from "@/features/editor/CodeEditor";
import { Button } from "@/design/components/Button";
import { Figure } from "@/features/lesson/Figure";
import { styles, textColor } from "./TokenStream.styles";

export interface TokenStreamProps {
  code: string;
  title?: string;
  /** Alternative inputs to switch between, e.g. two lookalikes that tokenize differently. */
  presets?: string[];
}

const SHOWN: Record<string, string> = { " ": "␣", "\t": "⇥", "\n": "↵", "\r": "", "\r\n": "↵" };

function show(piece: Piece) {
  if (piece.kind === "token") return piece.text;
  if (piece.what === "comment") return piece.text.length > 18 ? `${piece.text.slice(0, 17)}…` : piece.text;
  const visible = [...piece.text].map((char) => SHOWN[char] ?? "␣").join("");
  return visible.length > 4 ? `${visible.slice(0, 3)}…` : visible;
}

const LABEL: Record<TokenCategory, string> = {
  name: "name",
  keyword: "keyword",
  number: "number",
  string: "string",
  template: "text",
  regexp: "regex",
  operator: "operator",
  punctuation: "punct.",
};

/** Code on top, the tokens it splits into below: hover one to see where it came from. */
export function TokenStream({ code: initialCode, title = "From characters to tokens", presets }: TokenStreamProps) {
  const [code, setCode] = useState(initialCode);
  const [hovered, setHovered] = useState<Piece | null>(null);
  const [cursor, setCursor] = useState<number | null>(null);
  const deferred = useDeferredValue(code);
  const result = useMemo(() => tokenize(deferred), [deferred]);
  const tokenCount = tokensOf(result).length;
  const skippedCount = result.pieces.length - tokenCount;

  const atCursor =
    cursor === null ? null : result.pieces.find((piece) => piece.kind === "token" && piece.start <= cursor && cursor <= piece.end);
  const active = hovered ?? atCursor ?? null;

  const highlights: Highlight[] = [
    ...(result.error ? [{ start: result.error.pos, end: result.error.pos, tone: "error" as const }] : []),
    ...(active ? [{ start: active.start, end: active.end, tone: "focus" as const }] : []),
  ];

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
      <CodeEditor value={code} onChange={setCode} onCursor={setCursor} compact highlights={highlights} ariaLabel="Code to tokenize" />

      <ol aria-label={`${tokenCount} tokens`} {...stylex.props(styles.stream)} onMouseLeave={() => setHovered(null)}>
        {result.pieces.map((piece) => (
          <li
            key={`${piece.start}-${piece.end}`}
            onMouseEnter={() => setHovered(piece)}
            {...stylex.props(
              styles.piece,
              piece.kind === "token" ? styles.token : styles.skipped,
              piece.kind === "skipped" && piece.what === "newline" && styles.newline,
              active === piece && styles.active,
            )}
          >
            <span
              {...stylex.props(
                styles.text,
                piece.kind === "token" ? textColor[piece.category] : styles.skippedText,
              )}
            >
              {show(piece)}
            </span>
            <span {...stylex.props(styles.label)}>{piece.kind === "token" ? LABEL[piece.category] : piece.what === "whitespace" ? "skip" : piece.what}</span>
          </li>
        ))}
        {result.error && (
          <li {...stylex.props(styles.piece, styles.errorPiece)}>
            <span {...stylex.props(styles.text)}>✕</span>
            <span {...stylex.props(styles.label)}>stuck</span>
          </li>
        )}
      </ol>

      <p {...stylex.props(shared.caption, styles.summary)}>
        {[...deferred].length} characters → {tokenCount} tokens
        {skippedCount > 0 && <span {...stylex.props(styles.muted)}> · {skippedCount} skipped</span>}
      </p>
      {result.error && <p {...stylex.props(styles.error)}>The tokenizer got stuck: {result.error.message}</p>}
    </Figure>
  );
}
