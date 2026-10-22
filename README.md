# ASTs in Practice

`practice(ast)`: an interactive, browser-based course that teaches **how JavaScript source code becomes an
Abstract Syntax Tree, why that tree is required for code to run, and why every tool in
your toolchain depends on it**. Every lesson pairs a short explanation with something the
learner can try straight away.

---

## Lessons

Every lesson has the same shape: a short main path with hands-on figures, a **check
yourself** question with a hidden answer, a one-line takeaway, and an optional **Going
deeper** section for the curious.

Each lesson shows an estimated time, computed from its text at build time
(`src/features/progress/readingTime.ts`): prose at 200 words a minute, code at 60, a minute and a
half per figure (more for the hands-on labs) and half a minute per check. "Going deeper"
is counted separately. A bar at the top of each lesson shows how far you are through the
main path and roughly how long is left; opening "Going deeper" adds a separate, quieter
segment for it, so the main bar doesn't jump. Reaching the takeaway ticks the lesson off in
the sidebar; progress is kept in the browser only.

### 1. What is an AST?

**Goal:** understand that code is just text to a computer, and that an AST is the structure
hidden inside that text.

- See code the way the engine first receives it: a row of characters.
- See the same code as a tree: one root, nodes with named fields (`left`, `right`, `body`…).
- What the name means: *Abstract* (spacing and redundant parentheses disappear), *Syntax*
  (the grammar of the language), *Tree* (the shape).
- **Try it:** `price * quantity + tax` and `(price * quantity) + tax` produce the *same*
  tree; `price * (quantity + tax)` produces a different one.
- It's just objects: the ESTree format, produced by acorn throughout the course.

**Takeaway:** an AST captures what the code *means*, not how it was typed.

### 2. Why it's needed

**Goal:** understand that building a tree is not optional: the engine needs it to run your
code, and every tool needs it to understand your code.

- **A tree can be run:** evaluating the tree directly (a tree-walking interpreter) is
  simple but slow, so engines walk it once and write down steps.
- **Try it:** step through `price * quantity + tax`, then change it to
  `price * (quantity + tax)` and watch the steps change.
- **The engine parses everything first:** code with a syntax error on line 3 prints
  nothing, not even lines 1 and 2; a runtime error on line 3 does.
- **Then the tools:** Prettier, ESLint, TypeScript, Babel, bundlers, minifiers, editor
  features like "rename symbol" and "go to definition".
- **Try it:** rename `count` to `total` with find-and-replace next to an AST-based rename.
  The text version also changes a comment, a string, a shorthand property and a property
  access; those mistakes are highlighted in red.

**Takeaway:** text has no idea what a word *is*; the tree does.

### 3. Tokenizing

**Goal:** understand how characters become tokens, and why this is harder in JavaScript
than it looks.

- **Try it:** watch the code split into tokens, coloured by kind (keyword, name, number,
  string, operator, punctuation). Whitespace and comments are skipped; newlines are noted.
- **Longest match wins:** `a+++b` is `a ++ + b`, and `a+++++b` is a syntax error.
- **Context matters:** `/` can be division or the start of a regex (`x = a / b / g` vs
  `x = /b/g`), so the tokenizer and parser take turns, token by token.
- **Going deeper:** template literals, which line breaks end a statement (and why a line
  starting with `(` doesn't), and words like `let` and `of` that are only sometimes keywords.

**Takeaway:** a tokenizer cuts characters into words; in JavaScript, what a word *is* can
depend on what came before.

### 4. Parsing

**Goal:** understand how grammar rules turn tokens into a tree, and where JavaScript's
grammar gets ambiguous.

- **Grammar rules:** build a three-rule grammar for arithmetic, and see which rule matches
  which tokens. The operator that binds tightest gets the lowest rule.
- **Recursive descent:** step through a tiny parser, one function per rule, and watch the
  call stack go down while the tree grows up. Parentheses never become nodes.
- **Syntax errors:** broken inputs show what a syntax error is: a token that doesn't fit.
- **A JavaScript surprise:** `() => { total: 1 }` returns `undefined`, because `{` after
  `=>` opens a body.
- **Going deeper:** Acorn's precedence climbing, associativity, the spec's own grammar, and
  cover grammars: `(a, b)` only becomes arrow function parameters once `=>` appears.

**Takeaway:** the grammar decides the shape of the tree; the parser fits the tokens into
it, and a syntax error is a token that doesn't fit.

### 5. From tree to running code

**Goal:** understand what the engine does with the AST.

- See real V8 bytecode (captured with `node --print-bytecode`) next to the AST it came from:
  an accumulator, registers, and compact byte-sized instructions.
- **Branches become jumps:** an `if` turns into a test and a conditional jump.
- **Then the tree is thrown away:** lazy parsing, and bytecode flushing.
- **Going deeper:** the feedback vector, and Sparkplug, Maglev and TurboFan compiling hot
  functions from the bytecode.

**Takeaway:** bytecode is the tree flattened into steps: nesting becomes order, and
branches become jumps.

### 6. Scope and bindings

**Goal:** understand what the AST does *not* know, and how tools add meaning on top of it.

- An AST is syntax only: two `count` identifiers look identical even when they are
  different variables.
- **Try it:** click a variable and see its declaration and every reference, in examples
  with shadowing, blocks and a closure.
- **Renaming, done right:** rename one binding, not every name, even when it is shadowed.
- **The engine needs it too:** variables captured by a closure live in a heap context
  instead of a register.
- **One more layer, types:** TypeScript's binder creates symbols from the tree, and its
  checker works out types from them.
- **Going deeper:** scopes in ESLint rules, `var`, and the temporal dead zone.

**Takeaway:** the tree says what the code says; scope analysis says which declaration each
name means.

### 7. Transforming code

**Goal:** understand how tools change code: code → AST → modified AST → code.

- **Try it** with real transforms on editable code:
  - `var` → `let` (and why that isn't always safe without scope analysis)
  - remove `console.log` calls
  - `x ** 2` → `x * x`, where the tree keeps the grouping a text replace would break
- **Printing it back:** astring prints the whole tree from scratch and loses comments and
  blank lines; **recast** reprints only the changed nodes, which is what codemods need.
  Prettier deliberately takes the from-scratch route.
- **Taking the types out:** strip TypeScript the way Node.js does, by replacing type nodes
  with spaces (checked against Node's own output), and see why an enum is refused.
- **Source maps:** click a word in the output with types cut out and see that it moved;
  tools that move code write a source map, built from the tree's positions.
- **Going deeper:** visitors, how recast tracks what changed, and what's inside a source map.

**Takeaway:** tools change code by changing the tree and printing it again; what they keep
depends on the printer.

### 8. Build your own

**Goal:** apply everything by writing tools for your own codebase.

- **A rule is a visitor:** ESLint's `create(context)`, node-type keys and `context.report()`.
- **Who does the walking:** a walker in a few lines, with `:exit` on the way back up.
- **Try it:** edit rules and see them run live on editable code; apply their auto-fixes.
- **Use it in your project:** add the rule to `eslint.config.js` as a virtual plugin.
- **Going deeper:** rules that use scope, selectors, and a jscodeshift codemod.

**Takeaway:** a lint rule is a visitor: name the node types you care about, and report what
you find.

### 9. The AST landscape

**Goal:** understand the ecosystem of parsers and formats.

- **Try it:** the same code (JavaScript, TypeScript, JSX) parsed by acorn, Babel and
  TypeScript produces different trees, and not every parser accepts every dialect.
- **ESTree as the shared shape:** Espree, typescript-estree, Oxc and Babel's `estree` plugin.
- **How many times is your code parsed?** One file through VS Code, Prettier, ESLint, Vite
  and V8: five parsers, five trees. Toolchains like Oxc and Biome aim to share one parse.
- **The whole road:** a recap of the course, from characters to running code and tools.
- **Going deeper:** faster parsers (esbuild and TypeScript 7 in Go, SWC and Oxc in Rust),
  and how TypeScript and Biome keep whitespace and comments as trivia.

**Takeaway:** many parsers, many tree shapes; ESTree is the common one, and most tools still
parse your code for themselves.

---

## Explorer

A free-form tool available from every lesson, rather than a lesson of its own. Every code
example has an **Open in Explorer** button.

- Write any JavaScript and see its full tree.
- Hover a node to highlight its source; click in the code to jump to its node.
- Common node types come with a plain-language explanation.
- Presets: variables, functions, conditions, loops, classes, async code and modules.
- Opens with the code from a lesson's **Open in Explorer** button (`/explorer?code=…`).

---

## Project structure

The site is a course platform with one course on it, so a later `practice(<topic>)` course
is a new folder under `src/courses`, not a rewrite.

```
src/
  app/             router, routes and the course the site serves (app/course.ts)
  design/          design system: tokens, breakpoints, global.css, and components
                   with no knowledge of courses (Button, Loader, Pending, BrandMark)
  features/        the platform, one folder per feature:
    course/        the Course contract and its React context
    lesson/        lesson page, figures, sources, and what lessons import (authoring.ts)
    navigation/    app shell, sidebar, not-found page
    contents/      the title page
    progress/      reading time, reading progress, finished lessons
    editor/        CodeMirror editor
    theme/         light / dark / system
  courses/
    ast/           practice(ast)
      course.ts    the course: title, lessons, sources, tools
      content/     lessons (MDX), sources, examples
      features/    interactive figures by topic (tokenizing, parsing, scope, …),
                   the shared tree views, and the Explorer
      engine/      the AST logic, no React: parsing, tree, scope, transform, runtime
  types/           declarations for virtual and Node modules
```

- **Dependencies point one way:** `courses` may use `features` and `design`, never the other way
  round. The platform knows a course only through the `Course` interface
  (`src/features/course/course.ts`).
- **Every component has its own folder:** `Figure/Figure.tsx` for markup and behaviour,
  `Figure/Figure.styles.ts` for its StyleX styles, and `Figure/index.ts` to import it from.
- **Tests sit next to the code they test.**
- **Imports across folders use the `@/` alias** for `src/`.

---

## Stack

| Concern | Choice | Why |
|---|---|---|
| Language | **TypeScript** | Node types document the grammar; `switch (node.type)` mirrors how real tools work. |
| UI | **React 19** | Composes interactive widgets inside the lesson text. |
| Build | **Vite** | Fast dev server and build. |
| Routing and rendering | **TanStack Start** (on TanStack Router) | Type-safe routes and links between lessons; every page is prerendered to static HTML at build time. |
| Lesson content | **MDX** | Lessons read like Markdown with widgets embedded. |
| Styling | **StyleX** | Type-safe, compile-time CSS; design tokens via `defineVars`, each colour a `light-dark()` pair, with a light / dark / system toggle in the sidebar. |
| Code editor | **CodeMirror 6** | Editing, highlighting, node and error markers, cursor tracking. |
| Code listings | **Shiki** | Build-time syntax highlighting for code in the lessons. |
| Animation | **Motion** | Step-through tokenizing, bottom-up evaluation, tree changes. |
| Parser | **acorn** + **@types/estree** | Small, spec-faithful parser producing the standard ESTree format. |
| Scope analysis | **eslint-scope** | Declarations, references and shadowing for lesson 6. |
| Code generation | **astring**, **recast** | Printing a modified AST; recast preserves original formatting (lesson 7). |
| Lint rules | A small ESLint-compatible rule runner (`src/courses/ast/engine/transform/ruleRunner.ts`) | Runs learner-written rules live (lesson 8) without shipping ESLint. |
| Type stripping | A small stripper on **@babel/parser** (`src/courses/ast/engine/transform/stripTypes.ts`) | Blanks out TypeScript like Node.js does (lesson 7); tests compare it with Node's own `stripTypeScriptTypes`. |
| Other parsers | **@babel/parser**, **typescript** 5 (as `typescript5`) | Side-by-side tree comparisons (lesson 9). TypeScript 7 has no API yet, so the browser uses 5; `tsc` for the project itself is 7. |
| Testing | **Vitest** | Unit tests for the AST logic, plus checks that every lesson cites its sources. The type-stripping tests need Node.js 22.13 or later, for `stripTypeScriptTypes`. |

The result is a static site with no backend. Every page is prerendered to HTML at build
time (`dist/client`), so lesson text shows before any JavaScript loads and each lesson has
its own URL, title and file; the interactive figures then hydrate in the browser.
`404.html` comes from a catch-all route, for hosts like GitHub Pages that serve it for
unknown paths. `.github/workflows/deploy.yml` deploys to GitHub Pages under
`/<repository>/` (set through `BASE_PATH`).

Every lesson lists its sources in `src/courses/ast/content/sources.ts` and cites them inline with
`<Cite id="…" />`; `sources.test.ts` fails if a source is uncited or a citation unlisted.
