import type * as ESTree from "estree";

export interface NodeDoc {
  summary: string;
  example: string;
  /** What the node's most important fields hold. */
  fields?: Record<string, string>;
}

type NodeType = ESTree.Node["type"];

export const nodeDocs: Partial<Record<NodeType, NodeDoc>> = {
  Program: {
    summary: "The root of every tree: the whole file. Its body is the list of top-level statements.",
    example: "// everything in a file",
    fields: { body: "Top-level statements, in order.", sourceType: '"module" or "script".' },
  },

  // Statements
  ExpressionStatement: {
    summary:
      "An expression used where a statement is expected. Calling a function on its own line is the most common case: the call is an expression, the line is a statement.",
    example: "doSomething();",
    fields: { expression: "The expression being evaluated for its side effects." },
  },
  BlockStatement: {
    summary: "A pair of braces containing statements. Creates a new scope for let, const and class.",
    example: "{ let a = 1; }",
    fields: { body: "The statements inside the braces." },
  },
  EmptyStatement: { summary: "A lone semicolon that does nothing.", example: ";" },
  ReturnStatement: {
    summary: "Ends the function and hands a value back to the caller.",
    example: "return total;",
    fields: { argument: "The returned expression, or null for a bare `return`." },
  },
  IfStatement: {
    summary: "Runs one branch or the other depending on a condition.",
    example: "if (ready) start(); else wait();",
    fields: {
      test: "The condition.",
      consequent: "Runs when the condition is truthy.",
      alternate: "The else branch, or null.",
    },
  },
  SwitchStatement: {
    summary: "Compares a value against a list of cases.",
    example: "switch (key) { case 'a': break; }",
    fields: { discriminant: "The value being compared.", cases: "The case clauses." },
  },
  SwitchCase: {
    summary: "One `case` (or `default`) inside a switch.",
    example: "case 'a': run();",
    fields: { test: "The value to match; null for `default`.", consequent: "Statements to run." },
  },
  ThrowStatement: { summary: "Throws an exception.", example: "throw new Error('oops');" },
  TryStatement: {
    summary: "Runs a block and catches exceptions thrown inside it.",
    example: "try { risky(); } catch (e) { report(e); }",
    fields: { block: "The try block.", handler: "The catch clause.", finalizer: "The finally block." },
  },
  CatchClause: {
    summary: "The `catch` part of a try statement.",
    example: "catch (error) { ... }",
    fields: { param: "The caught value's binding (optional since ES2019).", body: "The handler block." },
  },
  WhileStatement: {
    summary: "Repeats its body while a condition is truthy.",
    example: "while (queue.length) process(queue.pop());",
  },
  DoWhileStatement: {
    summary: "Like while, but the body always runs at least once.",
    example: "do { tries++; } while (!ok);",
  },
  ForStatement: {
    summary: "The classic three-part loop.",
    example: "for (let i = 0; i < 10; i++) {}",
    fields: { init: "Runs once before the loop.", test: "Checked before each round.", update: "Runs after each round." },
  },
  ForInStatement: {
    summary: "Loops over the enumerable property names of an object.",
    example: "for (const key in settings) {}",
  },
  ForOfStatement: {
    summary: "Loops over the values of an iterable, like an array or a Map.",
    example: "for (const item of items) {}",
    fields: { await: "true for `for await`." },
  },
  BreakStatement: { summary: "Exits the nearest loop or switch.", example: "break;" },
  ContinueStatement: { summary: "Skips to the next round of the nearest loop.", example: "continue;" },
  LabeledStatement: { summary: "A statement with a label that break/continue can target.", example: "outer: for (;;) {}" },
  DebuggerStatement: { summary: "Pauses execution when developer tools are open.", example: "debugger;" },

  // Declarations
  VariableDeclaration: {
    summary: "Declares one or more variables with var, let or const.",
    example: "const total = price * 2;",
    fields: { kind: '"var", "let" or "const".', declarations: "One declarator per variable." },
  },
  VariableDeclarator: {
    summary: "One variable inside a declaration: the name (or destructuring pattern) and its initial value.",
    example: "total = price * 2",
    fields: { id: "The name or pattern being declared.", init: "The initial value, or null." },
  },
  FunctionDeclaration: {
    summary: "A named function declared as a statement. It is hoisted: usable before the line it is defined on.",
    example: "function add(a, b) { return a + b; }",
    fields: { id: "The function's name.", params: "The parameters.", body: "The function body." },
  },
  ClassDeclaration: {
    summary: "A class declared as a statement.",
    example: "class Cart extends Base {}",
    fields: { id: "The class name.", superClass: "What it extends, or null.", body: "The class members." },
  },
  ClassBody: { summary: "The members between a class's braces.", example: "{ add() {} }" },
  MethodDefinition: {
    summary: "A method, getter, setter or constructor in a class.",
    example: "get size() { return this.items.length; }",
    fields: { kind: '"constructor", "method", "get" or "set".', static: "true for static members." },
  },
  PropertyDefinition: { summary: "A class field.", example: "count = 0;" },
  StaticBlock: { summary: "A `static { }` initialisation block in a class.", example: "static { init(); }" },

  // Modules
  ImportDeclaration: {
    summary: "Imports bindings from another module. Bundlers read these statically to build the dependency graph.",
    example: "import { parse } from 'acorn';",
    fields: { specifiers: "What is imported.", source: "The module path." },
  },
  ImportSpecifier: { summary: "One named import.", example: "{ parse as acornParse }" },
  ImportDefaultSpecifier: { summary: "The default import.", example: "import React from 'react';" },
  ImportNamespaceSpecifier: { summary: "Imports the whole module as one object.", example: "import * as path from 'path';" },
  ImportExpression: { summary: "A dynamic `import()`, resolved at runtime.", example: "await import('./page.js')" },
  ExportNamedDeclaration: { summary: "Exports named bindings.", example: "export const answer = 42;" },
  ExportDefaultDeclaration: { summary: "Exports the module's default value.", example: "export default App;" },
  ExportAllDeclaration: { summary: "Re-exports everything from another module.", example: "export * from './utils.js';" },
  ExportSpecifier: { summary: "One named export.", example: "export { a as b };" },

  // Expressions
  Identifier: {
    summary:
      "A name: a variable, function, parameter or property name. The tree alone doesn't know which variable it refers to; that takes scope analysis.",
    example: "total",
    fields: { name: "The name as written." },
  },
  PrivateIdentifier: { summary: "A private class member name.", example: "#secret" },
  Literal: {
    summary: "A value written directly in the code: a number, string, boolean, null, regex or bigint.",
    example: "42, 'hello', true, null, /ab+c/",
    fields: { value: "The value it represents.", raw: "Exactly how it was written in the source." },
  },
  TemplateLiteral: {
    summary: "A backtick string. The fixed parts (quasis) and the ${} parts (expressions) alternate.",
    example: "`Hello ${name}!`",
    fields: { quasis: "The fixed text parts.", expressions: "The interpolated expressions." },
  },
  TemplateElement: { summary: "A fixed text part of a template literal.", example: "`Hello ` in `Hello ${name}`" },
  TaggedTemplateExpression: { summary: "A template literal processed by a function.", example: "html`<p>${text}</p>`" },
  ThisExpression: { summary: "The `this` keyword.", example: "this" },
  Super: { summary: "The `super` keyword, used in classes.", example: "super.render()" },
  ArrayExpression: {
    summary: "An array literal.",
    example: "[1, 2, 3]",
    fields: { elements: "The elements; null for holes like [1, , 3]." },
  },
  ObjectExpression: { summary: "An object literal.", example: "{ a: 1, b }", fields: { properties: "Its properties." } },
  Property: {
    summary: "A key-value pair in an object literal or destructuring pattern.",
    example: "price: 10",
    fields: {
      key: "The property name.",
      value: "The value (or the target in a pattern).",
      shorthand: "true for `{ price }`, which means `{ price: price }`.",
      computed: "true for `{ [key]: value }`.",
    },
  },
  FunctionExpression: { summary: "A function used as a value.", example: "const add = function (a, b) {};" },
  ArrowFunctionExpression: {
    summary: "An arrow function. It has no own `this`, and the body can be a single expression.",
    example: "(a, b) => a + b",
    fields: { params: "The parameters.", body: "A block, or an expression that is returned.", expression: "true when the body is an expression." },
  },
  ClassExpression: { summary: "A class used as a value.", example: "const Cart = class {};" },
  UnaryExpression: {
    summary: "An operator applied to one operand, written before it.",
    example: "-x, !done, typeof value",
    fields: { operator: "-, +, !, ~, typeof, void or delete.", argument: "The operand." },
  },
  UpdateExpression: {
    summary: "Increments or decrements a variable.",
    example: "i++, --count",
    fields: { operator: "++ or --.", prefix: "true for ++i, false for i++." },
  },
  BinaryExpression: {
    summary:
      "An operator with a left and a right operand. Precedence decides the nesting: in 1 + 2 * 3, the * expression is the right side of the +.",
    example: "price * quantity",
    fields: { operator: "The operator, e.g. + or ===.", left: "The left operand.", right: "The right operand." },
  },
  LogicalExpression: {
    summary: "&&, || or ??. Separate from BinaryExpression because the right side may never be evaluated (short-circuiting).",
    example: "user && user.name",
  },
  AssignmentExpression: {
    summary: "Assigns a value. It is an expression, so it has a value itself: that's why a = b = 0 works.",
    example: "total += price",
    fields: { operator: "=, +=, ??= and friends.", left: "The target.", right: "The value." },
  },
  ConditionalExpression: {
    summary: "The ternary operator.",
    example: "ok ? 'yes' : 'no'",
    fields: { test: "The condition.", consequent: "Value when truthy.", alternate: "Value when falsy." },
  },
  CallExpression: {
    summary: "Calls a function.",
    example: "fetch(url, options)",
    fields: { callee: "What is being called.", arguments: "The arguments.", optional: "true for f?.()." },
  },
  NewExpression: { summary: "Creates an object with `new`.", example: "new Map()" },
  MemberExpression: {
    summary: "Accesses a property. `computed` tells dot access (obj.key) from bracket access (obj[key]).",
    example: "user.name, items[0]",
    fields: { object: "The object.", property: "The property name or expression.", computed: "true for obj[key]." },
  },
  ChainExpression: { summary: "Wraps an optional chain so it can short-circuit as a whole.", example: "user?.address?.city" },
  SequenceExpression: { summary: "Comma-separated expressions; the last one is the value.", example: "(a++, b++)" },
  YieldExpression: { summary: "Pauses a generator and produces a value.", example: "yield item" },
  AwaitExpression: { summary: "Waits for a promise inside an async function.", example: "await response.json()" },
  SpreadElement: { summary: "Spreads an iterable or object into a list.", example: "[...items], f(...args)" },
  MetaProperty: { summary: "A special property like import.meta or new.target.", example: "import.meta.url" },

  // Patterns
  ObjectPattern: { summary: "Destructures properties from an object.", example: "const { name, age } = user;" },
  ArrayPattern: { summary: "Destructures elements from an iterable.", example: "const [first, second] = list;" },
  RestElement: { summary: "Collects the remaining items in a pattern or parameter list.", example: "(...args) => {}" },
  AssignmentPattern: { summary: "A default value in a pattern or parameter.", example: "function f(size = 10) {}" },
};

export function explain(type: string): NodeDoc {
  return (
    nodeDocs[type as NodeType] ?? {
      summary: "No explanation written for this node type yet.",
      example: "",
    }
  );
}
