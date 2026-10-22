import { createRouter, parseSearchWith, stringifySearchWith } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    // Search values stay plain text. By default they're read as JSON, so a shared
    // /explorer?code=42 or ?code=[1, 2] would arrive as a number or an array, not code.
    parseSearch: parseSearchWith((value) => value),
    stringifySearch: stringifySearchWith(JSON.stringify),
    // No basepath here: TanStack Start takes it from Vite's base (BASE_PATH, see vite.config.ts).
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
