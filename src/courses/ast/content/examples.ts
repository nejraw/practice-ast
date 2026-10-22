// Longer code samples used by the lessons. Kept here instead of inline in
// MDX, where multi-line strings are awkward to write and easy to break.

export const runExamples = [
  {
    name: "Syntax error",
    code: `console.log("hello");
console.log("world");
let total = ;`,
  },
  {
    name: "Runtime error",
    code: `console.log("hello");
console.log("world");
let total = missingFunction();`,
  },
];

export const renameExample = `let count = 0;
const counter = document.querySelector("#counter");

// count the clicks
function increment() {
  count = count + 1;
  counter.textContent = "count: " + count;
}

const stats = { count, label: "clicks" };
console.log(stats.count);`;

/** Lesson 6: code where the same name means different variables. */
export const scopePresets = [
  {
    label: "Two counts",
    code: `let count = 0;

function tally(items) {
  let count = 0;
  for (const item of items) count += item;
  return count;
}

count = tally([1, 2, 3]);
console.log(count);`,
  },
  {
    label: "A closure",
    code: `function counter() {
  let count = 0;
  let label = "clicks";
  return () => ++count;
}

const next = counter();
next();`,
  },
  {
    label: "Blocks",
    code: `const items = [3, 1, 2];

for (let i = 0; i < items.length; i++) {
  const item = items[i];
  if (item > 1) {
    const item = "big";
    console.log(item);
  }
}`,
  },
];

/** Lesson 6: the rename from lesson 2, now with a shadowing variable. */
export const shadowRenameExample = `let count = 0;

function increment() {
  count = count + 1;
}

function tally(items) {
  let count = 0;
  for (const item of items) count += item;
  return count;
}

const stats = { count, label: "clicks" };`;

/** Lesson 7: code with comments and personal formatting, to see what printing keeps. */
export const transformExample = `// Body mass index helpers
var DIGITS = 1;

function bmi(weight, height) {
  console.log('bmi for', weight, height);
  return weight / height ** 2; // kg/m²
}

function describe(w, h) {
  var value = bmi(w, h);
  return \`BMI: \${value.toFixed(DIGITS)}\`;
}`;

/** Lesson 8: lint rules in ESLint's shape, and code to run them on. */
export const rulePresets = [
  {
    label: "no-var",
    rule: `const rule = {
  meta: { fixable: "code" },
  create(context) {
    return {
      VariableDeclaration(node) {
        if (node.kind !== "var") return;
        context.report({
          node,
          message: "Use let or const instead of var.",
          // \`var\` is always the first three characters of the declaration.
          fix: (fixer) => fixer.replaceTextRange([node.range[0], node.range[0] + 3], "let"),
        });
      },
    };
  },
};`,
  },
  {
    label: "no-console",
    rule: `const rule = {
  create(context) {
    return {
      MemberExpression(node) {
        if (node.object.type === "Identifier" && node.object.name === "console") {
          context.report({
            node,
            message: "Unexpected console.{{ method }}.",
            data: { method: context.sourceCode.getText(node.property) },
          });
        }
      },
    };
  },
};`,
  },
  {
    label: "max-params",
    rule: `const MAX = 2;

const rule = {
  create(context) {
    function check(node) {
      if (node.params.length > MAX) {
        context.report({
          node,
          message: "{{ name }} has {{ count }} parameters; the limit is " + MAX + ".",
          data: { name: node.id ? node.id.name : "This function", count: node.params.length },
        });
      }
    }
    return {
      FunctionDeclaration: check,
      ArrowFunctionExpression: check,
    };
  },
};`,
  },
  {
    label: "deepest nesting",
    rule: `// Counts how deep blocks nest: +1 going down, -1 coming back up.
const rule = {
  create(context) {
    let depth = 0;
    return {
      BlockStatement(node) {
        depth++;
        if (depth === 3) context.report({ node, message: "Blocks nested 3 deep: consider a helper function." });
      },
      "BlockStatement:exit"() {
        depth--;
      },
    };
  },
};`,
  },
];

export const ruleTarget = `var total = 0;

function addItem(cart, item, quantity) {
  for (const line of cart) {
    if (line.id === item.id) {
      if (quantity > 0) {
        line.quantity += quantity;
      }
    }
  }
  console.log("added", item.id);
}

const format = (n) => \`€\${n.toFixed(2)}\`;
console.warn(format(total));`;

/** Lesson 9: the same idea in three dialects. */
export const parserPresets = [
  { label: "JavaScript", language: "js" as const, code: `const total = price * 2; // in euros` },
  { label: "TypeScript", language: "ts" as const, code: `const total: number = price * 2;` },
  { label: "JSX", language: "jsx" as const, code: `const label = <b>{total}</b>;` },
];

/** Lesson 7: TypeScript to strip, and one file Node.js refuses. */
export const typeStripPresets = [
  {
    label: "types",
    code: `interface Item {
  name: string;
  price: number;
}

export function total(items: Item[], tax?: number): number {
  const sum = items.reduce((acc, item) => acc + item.price, 0);
  return sum * (1 + (tax ?? 0));
}

console.log(total([{ name: "pen", price: 2 }], 0.21) as number);`,
  },
  {
    label: "classes and generics",
    code: `type Id = string;

class Cart<T extends { id: Id }> implements Iterable<T> {
  private readonly items: T[] = [];

  add(item: T): this {
    this.items.push(item);
    return this;
  }

  [Symbol.iterator]() {
    return this.items.values();
  }
}

const cart = new Cart<{ id: Id }>().add({ id: "a" });
const button = document.querySelector("button")!;`,
  },
  {
    label: "an enum",
    refused: true,
    code: `enum Size {
  Small,
  Large,
}

function label(size: Size): string {
  return size === Size.Small ? "S" : "L";
}`,
  },
];
