import { StateEffect, StateField, type Range, type Text } from "@codemirror/state";
import { Decoration, EditorView, WidgetType, type DecorationSet } from "@codemirror/view";

export interface Highlight {
  start: number;
  end: number;
  tone: "focus" | "error" | "good" | "bad";
}

export const setHighlights = StateEffect.define<Highlight[]>();

const marks = {
  focus: Decoration.mark({ class: "cm-ast-focus" }),
  error: Decoration.mark({ class: "cm-ast-error" }),
  good: Decoration.mark({ class: "cm-ast-good" }),
  bad: Decoration.mark({ class: "cm-ast-bad" }),
};

/** A squiggle with no text under it: an error at the end of a line or of the code, where there's nothing to underline. */
class ErrorAtEnd extends WidgetType {
  toDOM() {
    const squiggle = document.createElement("span");
    squiggle.className = "cm-ast-error cm-ast-error-end";
    squiggle.setAttribute("aria-hidden", "true");
    return squiggle;
  }
  eq() {
    return true;
  }
}
const errorAtEnd = Decoration.widget({ widget: new ErrorAtEnd(), side: 1 });

const isWord = (char: string) => /[\w$]/.test(char);

function build(highlights: Highlight[], doc: Text): DecorationSet {
  const ranges: Range<Decoration>[] = [];
  const length = doc.length;
  for (const { start, end, tone } of highlights) {
    let from = Math.max(0, Math.min(start, length));
    let to = Math.max(from, Math.min(end, length));
    // Errors often point at a position, not a range: mark the word or character there.
    if (from === to) {
      const char = doc.sliceString(from, from + 1);
      if (tone === "error" && (char === "" || char === "\n")) {
        ranges.push(errorAtEnd.range(from));
        continue;
      }
      if (to < length) to += 1;
      else if (from > 0) from -= 1;
      else continue;
      if (tone === "error" && isWord(char)) {
        while (to < length && isWord(doc.sliceString(to, to + 1))) to++;
      }
    }
    ranges.push(marks[tone].range(from, to));
  }
  return Decoration.set(ranges, true);
}

export const highlightField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(decorations, transaction) {
    let next = decorations.map(transaction.changes);
    for (const effect of transaction.effects) {
      if (effect.is(setHighlights)) next = build(effect.value, transaction.state.doc);
    }
    return next;
  },
  provide: (field) => EditorView.decorations.from(field),
});
