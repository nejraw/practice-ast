// The project has no Node.js types, on purpose: the app runs in the browser.
// These are the few Node APIs used at build and test time.

// stripTypes.test.ts compares with Node's own type stripping.
declare module "node:module" {
  export function stripTypeScriptTypes(code: string): string;
}

// The lesson-times plugin in vite.config.ts reads the lesson files.
declare module "node:fs" {
  export function readdirSync(path: URL): string[];
  export function readFileSync(path: URL, encoding: "utf8"): string;
}

// vite.config.ts and vitest.config.ts resolve the `@/` alias.
declare module "node:url" {
  export function fileURLToPath(url: URL | string): string;
}
