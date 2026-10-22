import { useEffect, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { applyTheme, savedTheme, THEMES, type Theme } from "@/features/theme/theme";
import { styles } from "./ThemeToggle.styles";

export function ThemeToggle() {
  // Pages are prerendered without storage; read the saved choice once in the browser.
  const [theme, setTheme] = useState<Theme>("system");
  useEffect(() => setTheme(savedTheme()), []);

  return (
    <div role="group" aria-label="Colour theme" {...stylex.props(styles.group)}>
      {THEMES.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={theme === option}
          onClick={() => {
            applyTheme(option);
            setTheme(option);
          }}
          {...stylex.props(styles.option, theme === option && styles.active)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
