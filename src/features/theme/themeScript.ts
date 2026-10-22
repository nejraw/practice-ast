import { THEME_STORAGE_KEY } from "./theme";

/**
 * Applies the saved theme before first paint. It runs before React, so it is
 * plain inline script, added to the document head by the root route.
 */
export const themeScript = `try {
  const theme = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
  if (theme === "light" || theme === "dark") document.documentElement.dataset.theme = theme;
} catch {}`;
