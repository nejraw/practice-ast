import * as stylex from "@stylexjs/stylex";
import { shared } from "@/design/shared.styles";
import { styles } from "./ToolGrid.styles";

const tools = [
  { name: "JavaScript engines", examples: "V8, SpiderMonkey, JavaScriptCore", uses: "Parse to an AST, then compile it to bytecode." },
  { name: "Formatters", examples: "Prettier, Biome", uses: "Parse, throw the original layout away, and print the tree again." },
  { name: "Linters", examples: "ESLint, oxlint", uses: "Walk the tree and report patterns, like an unused variable." },
  { name: "Type checkers", examples: "TypeScript, Flow", uses: "Check the tree against types, then remove the type annotations." },
  { name: "Compilers", examples: "Babel, SWC", uses: "Rewrite modern syntax into older syntax, tree to tree." },
  { name: "Bundlers", examples: "Vite, Rollup, webpack, esbuild", uses: "Read import and export nodes to build the dependency graph, and tree-shake." },
  { name: "Minifiers", examples: "Terser, esbuild", uses: "Shorten names, fold constants and remove dead code." },
  { name: "Editors", examples: "VS Code, WebStorm", uses: "Rename symbol, go to definition, outline, code folding." },
];

/** A ruled list, like a table in a reference book. */
export function ToolGrid() {
  return (
    <dl {...stylex.props(styles.list)}>
      <div {...stylex.props(styles.row, styles.head)} aria-hidden>
        <span {...stylex.props(shared.caption)}>Tool</span>
        <span {...stylex.props(shared.caption)}>What it does with the tree</span>
      </div>
      {tools.map((tool) => (
        <div key={tool.name} {...stylex.props(styles.row)}>
          <dt {...stylex.props(styles.name)}>
            {tool.name}
            <span {...stylex.props(styles.examples)}>{tool.examples}</span>
          </dt>
          <dd {...stylex.props(styles.uses)}>{tool.uses}</dd>
        </div>
      ))}
    </dl>
  );
}
