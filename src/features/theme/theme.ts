export type Theme = "light" | "dark" | "system";

export const THEMES: Theme[] = ["light", "dark", "system"];

/** Also read by the inline script in themeScript.ts, which applies the choice before first paint. */
export const THEME_STORAGE_KEY = "theme";

export function savedTheme(): Theme {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    if (value === "light" || value === "dark") return value;
  } catch {
    // Storage can be blocked; fall back to the system setting.
  }
  return "system";
}

/** `data-theme` on <html> pins color-scheme (see global.css); without it the system decides. */
export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") delete root.dataset.theme;
  else root.dataset.theme = theme;
  try {
    if (theme === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Without storage the choice lasts until the page reloads.
  }
}
