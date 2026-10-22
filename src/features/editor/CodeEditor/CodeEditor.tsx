import { useEffect, useId, useRef, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { EditorState, type Extension } from "@codemirror/state";
import { drawSelection, EditorView, highlightActiveLine, keymap, lineNumbers, placeholder as placeholderExtension } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { bracketMatching, syntaxHighlighting } from "@codemirror/language";
import { javascript } from "@codemirror/lang-javascript";
import { highlightField, setHighlights, type Highlight } from "@/features/editor/highlights";
import { editorHighlightStyle, editorTheme } from "@/features/editor/theme";
import { styles } from "./CodeEditor.styles";

export type { Highlight };

export interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  /** Called with the cursor offset whenever the selection moves. */
  onCursor?: (offset: number) => void;
  highlights?: Highlight[];
  readOnly?: boolean;
  /** Hide line numbers, for one-line inputs. */
  compact?: boolean;
  placeholder?: string;
  /** Wrap long lines. Defaults to wrapping read-only results, which are often side by side. */
  wrap?: boolean;
  ariaLabel: string;
}

export function CodeEditor({
  value,
  onChange,
  onCursor,
  highlights = [],
  readOnly = false,
  compact = false,
  placeholder,
  wrap = readOnly,
  ariaLabel,
}: CodeEditorProps) {
  const host = useRef<HTMLDivElement>(null);
  const hintId = useId();
  const [focused, setFocused] = useState(false);
  const view = useRef<EditorView | null>(null);
  // Callbacks change on every render; the editor reads the latest through refs.
  const callbacks = useRef({ onChange, onCursor });
  callbacks.current = { onChange, onCursor };
  // Also read when the editor is created, so a recreated editor starts with them.
  const latestHighlights = useRef(highlights);
  latestHighlights.current = highlights;

  useEffect(() => {
    const extensions: Extension[] = [
      history(),
      drawSelection(),
      bracketMatching(),
      javascript(),
      syntaxHighlighting(editorHighlightStyle),
      editorTheme,
      highlightField,
      keymap.of([indentWithTab, ...defaultKeymap, ...historyKeymap]),
      EditorView.contentAttributes.of({ "aria-label": ariaLabel, ...(!readOnly && { "aria-describedby": hintId }) }),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) callbacks.current.onChange?.(update.state.doc.toString());
        if (update.selectionSet) callbacks.current.onCursor?.(update.state.selection.main.head);
      }),
      EditorState.readOnly.of(readOnly),
    ];
    if (!compact) extensions.push(lineNumbers(), highlightActiveLine());
    if (wrap) extensions.push(EditorView.lineWrapping);
    if (placeholder) extensions.push(placeholderExtension(placeholder));

    const editor = new EditorView({
      parent: host.current!,
      state: EditorState.create({ doc: value, extensions }),
    });
    editor.dispatch({ effects: setHighlights.of(latestHighlights.current) });
    view.current = editor;
    return () => {
      editor.destroy();
      view.current = null;
    };
    // The editor is created once; `value` and `highlights` are synced below.
  }, [readOnly, compact, placeholder, wrap, ariaLabel, hintId]);

  // Replace the document only when it changed from the outside (e.g. a preset).
  useEffect(() => {
    const editor = view.current;
    if (editor && editor.state.doc.toString() !== value) {
      editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: value } });
    }
  }, [value]);

  const highlightKey = JSON.stringify(highlights);
  useEffect(() => {
    view.current?.dispatch({ effects: setHighlights.of(highlights) });
    // Compare by content, not identity: callers usually pass a fresh array.
  }, [highlightKey]);

  // Tab indents, so keyboard users need to know the way out (WCAG 2.1.2, no keyboard trap).
  // CodeMirror's: after Escape, the next Tab within two seconds moves focus on.
  // Read-only editors can't indent, so Tab leaves them as usual.
  return (
    <div {...stylex.props(styles.wrap)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}>
      <div ref={host} {...stylex.props(styles.host, readOnly && styles.readOnly)} />
      {!readOnly && (
        <p id={hintId} {...stylex.props(styles.hint, focused && styles.hintShown)}>
          Tab indents · Esc, then Tab, to leave
        </p>
      )}
    </div>
  );
}
