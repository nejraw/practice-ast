import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import mdx from "@mdx-js/rollup";
import rehypeShiki from "@shikijs/rehype";
import { createCssVariablesTheme } from "shiki/core";
import remarkGfm from "remark-gfm";
import stylex from "@stylexjs/unplugin";
import { Features } from "lightningcss";
import { estimateLessonTime, type LabMinutes } from "./src/features/progress/readingTime.ts";
import { labMinutes } from "./src/courses/ast/content/labMinutes.ts";

// Code blocks take their colours from CSS variables defined in global.css, so
// they share the site's syntax palette and follow the theme automatically.
const inkTheme = createCssVariablesTheme({ name: "ink", variablePrefix: "--shiki-", fontStyle: true });

// Colours are light-dark() pairs that follow the page's color-scheme (see global.css).
// Lightning CSS would rewrite them into a fallback that only works when every CSS file
// gets the same rewrite, which isn't true in dev; keep the native function everywhere.
const lightningcss = { exclude: Features.LightDark };

// `@/…` imports resolve from src/. StyleX resolves them itself, to find the
// variables a component uses in the .stylex.ts file that defines them.
const src = fileURLToPath(new URL("./src", import.meta.url));

// Estimated time per lesson, as `virtual:lesson-times`, so the sidebar can show
// it without shipping the text of every lesson.
function lessonTimes({ dir, labMinutes }: { dir: URL; labMinutes: LabMinutes }): Plugin {
  const id = "virtual:lesson-times";
  return {
    name: "lesson-times",
    resolveId: (source) => (source === id ? `\0${id}` : undefined),
    load(resolved) {
      if (resolved !== `\0${id}`) return;
      const times: Record<string, unknown> = {};
      for (const file of readdirSync(dir).filter((name) => name.endsWith(".mdx"))) {
        const path = new URL(file, dir);
        this.addWatchFile(fileURLToPath(path));
        times[file.replace(/\.mdx$/, "")] = estimateLessonTime(readFileSync(path, "utf8"), labMinutes);
      }
      return `export default ${JSON.stringify(times)};`;
    },
  };
}

export default defineConfig(({ mode }) => ({
  // Where the site is served from: "/" locally, "/<repo>/" on GitHub Pages (set by the
  // deploy workflow through BASE_PATH). The router reads it as import.meta.env.BASE_URL.
  base: loadEnv(mode, ".", "").BASE_PATH || "/",
  resolve: { alias: { "@": src } },
  plugins: [
    lessonTimes({ dir: new URL("./src/courses/ast/content/lessons/", import.meta.url), labMinutes }),
    {
      enforce: "pre",
      ...mdx({
        providerImportSource: "@mdx-js/react",
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          [rehypeShiki, { theme: inkTheme }],
        ],
      }),
    },
    // Every page is rendered to HTML at build time, so it works as static files
    // (GitHub Pages) and shows its content before any JavaScript runs.
    tanstackStart({
      // The router, its routes and the generated route tree live in src/app.
      srcDirectory: "src/app",
      prerender: {
        enabled: true,
        crawlLinks: true,
        failOnError: true,
        // "Open in Explorer" links carry code in the query string; it's the same page.
        filter: ({ path }) => !path.includes("?"),
      },
      // GitHub Pages serves 404.html for any path it doesn't know. /404 is caught by
      // the catch-all route (src/app/routes/$.tsx), which shows "Page not found".
      pages: [{ path: "/404", prerender: { enabled: true, outputPath: "/404.html" } }],
    }),
    // devPersistToDisk lets the server render and the browser share the styles
    // StyleX collects in development; the dev CSS is linked from __root.tsx.
    // The debug attribute names a source line, which differs between Start's
    // server and client transforms and would trip React's hydration check.
    stylex.vite({
      lightningcssOptions: lightningcss,
      devPersistToDisk: true,
      enableDebugDataProp: false,
      aliases: { "@/*": [`${src}/*`] },
    }),
    // Must come after TanStack Start's plugin.
    react({ include: /\.(mdx|tsx?)$/ }),
  ],
  css: { lightningcss },
  optimizeDeps: {
    // Lessons and widgets are lazy-loaded, so Vite can't discover these on startup.
    // Pre-bundling them avoids a forced reload on the first visit to a lesson.
    include: [
      "@codemirror/commands",
      "@codemirror/lang-javascript",
      "@codemirror/language",
      "@codemirror/state",
      "@codemirror/view",
      "@lezer/highlight",
      "@mdx-js/react",
      "acorn",
      "astring",
      "motion/react",
    ],
  },
}));
