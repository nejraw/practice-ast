import { parse } from "acorn";
import { analyze, type Scope, type Variable } from "eslint-scope";
import type * as ESTree from "estree";
import type { Positioned } from "@/courses/ast/engine/parsing/parse";
import type { Span } from "@/courses/ast/engine/parsing/position";
import type { Edit } from "@/courses/ast/engine/transform/edits";
import { shorthandExpansions } from "./rename";

/**
 * Scope analysis on top of the tree: which declaration each name refers to.
 * A thin layer over eslint-scope, ESLint's own scope analyzer, reshaped for
 * the lessons.
 */

export interface Occurrence extends Span {
  /** True for the name in the declaration itself. */
  declaration: boolean;
  /** The scope the name is written in, which is where it gets looked up. */
  scope: ScopeInfo;
}

export interface Binding {
  id: number;
  name: string;
  /** How it was declared: "let", "const", "var", "function", "parameter", "class", "import" or "catch". */
  kind: string;
  declaration: Span;
  /** Every place the name appears for this binding, declaration included, in source order. */
  occurrences: Occurrence[];
  scope: ScopeInfo;
  /** Used from inside a nested function: it must outlive the call that created it. */
  captured: boolean;
}

export interface ScopeInfo {
  id: number;
  /** eslint-scope's scope type: "module", "function", "block", "for", "class", "catch", … */
  type: string;
  /** The node that creates the scope, with its name if it's a named function or class. */
  node: Span & { type: string; name?: string };
  depth: number;
  /** The scope around this one; null for the file. */
  parent: ScopeInfo | null;
  bindings: Binding[];
}

export interface GlobalName {
  name: string;
  occurrences: Array<Span & { scope: ScopeInfo | null }>;
}

export interface ScopeAnalysis {
  scopes: ScopeInfo[];
  bindings: Binding[];
  /** Names used but never declared in the code, such as `console`. */
  globals: GlobalName[];
}

function kindOf(variable: Variable): string {
  const def = variable.defs[0];
  switch (def?.type) {
    case "Variable":
      return (def.parent as ESTree.VariableDeclaration).kind;
    case "FunctionName":
      return "function";
    case "Parameter":
      return "parameter";
    case "ClassName":
      return "class";
    case "ImportBinding":
      return "import";
    case "CatchClause":
      return "catch";
    default:
      return "variable";
  }
}

const range = (node: ESTree.Node): Span => ({ start: (node as Positioned).start, end: (node as Positioned).end });

export function analyzeScopes(ast: Positioned<ESTree.Program>): ScopeAnalysis {
  const manager = analyze(ast as ESTree.Program, { ecmaVersion: 2025, sourceType: "module" });
  const infos = new Map<Scope, ScopeInfo>();
  const bindings: Binding[] = [];

  const depthOf = (scope: Scope): number => (scope.upper ? depthOf(scope.upper) + 1 : 0);

  // All scopes first: a reference can come from a scope nested deeper than its variable's.
  for (const scope of manager.scopes) {
    // The global scope only holds the implicit names; module code lives one level down.
    if (scope.type === "global") continue;
    infos.set(scope, {
      id: infos.size,
      type: scope.type,
      node: {
        ...range(scope.block),
        type: scope.block.type,
        name: (scope.block as { id?: ESTree.Identifier | null }).id?.name,
      },
      depth: depthOf(scope) - 1,
      parent: (scope.upper && infos.get(scope.upper)) ?? null,
      bindings: [],
    });
  }

  for (const [scope, info] of infos) {
    for (const variable of scope.variables) {
      // `arguments` is created implicitly in every non-arrow function.
      if (variable.defs.length === 0) continue;
      const seen = new Map<number, Occurrence>();
      for (const identifier of variable.identifiers) seen.set(range(identifier).start, { ...range(identifier), declaration: true, scope: info });
      for (const reference of variable.references) {
        const at = range(reference.identifier);
        if (!seen.has(at.start)) seen.set(at.start, { ...at, declaration: false, scope: infos.get(reference.from) ?? info });
      }
      const captured = variable.references.some((reference) => reference.from.variableScope !== scope.variableScope);
      const binding: Binding = {
        id: bindings.length,
        name: variable.name,
        kind: kindOf(variable),
        declaration: range(variable.identifiers[0]),
        occurrences: [...seen.values()].sort((a, b) => a.start - b.start),
        scope: info,
        captured,
      };
      bindings.push(binding);
      info.bindings.push(binding);
    }
  }

  const globals = new Map<string, GlobalName["occurrences"]>();
  for (const reference of manager.globalScope?.through ?? []) {
    const list = globals.get(reference.identifier.name) ?? [];
    list.push({ ...range(reference.identifier), scope: infos.get(reference.from) ?? null });
    globals.set(reference.identifier.name, list);
  }

  return {
    scopes: [...infos.values()],
    bindings,
    globals: [...globals].map(([name, occurrences]) => ({ name, occurrences })),
  };
}

/** The binding whose name is at (or touches) this offset, if any. */
export function bindingAt(analysis: ScopeAnalysis, offset: number): Binding | undefined {
  return analysis.bindings.find((binding) =>
    binding.occurrences.some((occurrence) => occurrence.start <= offset && offset <= occurrence.end),
  );
}

/** Whether `inner` is `outer` or nested somewhere inside it. */
function isWithin(inner: ScopeInfo | null, outer: ScopeInfo): boolean {
  for (let scope = inner; scope; scope = scope.parent) if (scope === outer) return true;
  return false;
}

/** A binding called `name` declared between `from` (included) and `until` (excluded), walking outwards. */
function declaredBetween(name: string, from: ScopeInfo, until: ScopeInfo): Binding | undefined {
  for (let scope: ScopeInfo | null = from; scope && scope !== until; scope = scope.parent) {
    const found = scope.bindings.find((binding) => binding.name === name);
    if (found) return found;
  }
  return undefined;
}

/**
 * Why renaming `binding` to `to` would break the code, or null if it's safe.
 * These are the checks an editor's "rename symbol" makes before it changes anything:
 * the new name must be allowed, and no name may end up meaning a different variable.
 */
export function renameConflict(analysis: ScopeAnalysis, binding: Binding, to: string, code: string): string | null {
  if (to === binding.name) return null;
  if (!/^[A-Za-z_$][\w$]*$/.test(to)) return `${to || "An empty name"} is not a valid name.`;
  try {
    // Lessons parse code as a module, which is strict: this also rejects `eval`, `await` and friends.
    parse(`let ${to};`, { ecmaVersion: "latest", sourceType: "module" });
  } catch {
    return `${to} is a reserved word.`;
  }

  const line = (offset: number) => code.slice(0, offset).split("\n").length;
  const clash = binding.scope.bindings.find((other) => other !== binding && other.name === to);
  if (clash) return `${to} is already declared in the same scope, on line ${line(clash.declaration.start)}.`;

  // A use of the binding inside a scope that declares `to` would point at that variable instead.
  for (const occurrence of binding.occurrences) {
    const shadow = declaredBetween(to, occurrence.scope, binding.scope);
    if (shadow) return `On line ${line(occurrence.start)}, ${to} already means the variable declared on line ${line(shadow.declaration.start)}.`;
  }

  // A use of an outer `to` inside the binding's scope would point at the renamed variable instead.
  const usesOfTo = [
    ...analysis.bindings.filter((other) => other.name === to && !isWithin(other.scope, binding.scope)).flatMap((other) => other.occurrences),
    ...(analysis.globals.find((global) => global.name === to)?.occurrences ?? []),
  ];
  for (const use of usesOfTo) {
    if (use.scope && isWithin(use.scope, binding.scope) && !declaredBetween(to, use.scope, binding.scope)) {
      return `On line ${line(use.start)}, ${to} refers to another variable, which the renamed one would hide.`;
    }
  }
  return null;
}

/**
 * Renames one binding: exactly the names that refer to it, nothing else.
 * Shorthand syntax is expanded so property names stay the same. Check
 * `renameConflict` first: this doesn't stop a new name from clashing.
 */
export function renameBinding(ast: Positioned<ESTree.Program>, binding: Binding, to: string): Edit[] {
  const expansions = shorthandExpansions(ast);
  return binding.occurrences.map((occurrence) => ({
    start: occurrence.start,
    end: occurrence.end,
    replacement: expansions.get(occurrence.start)?.(binding.name, to) ?? to,
  }));
}
