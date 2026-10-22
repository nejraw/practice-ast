import { useState, type ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { BrandMark } from "@/design/components/BrandMark";
import { useCourse } from "@/features/course";
import { Sidebar } from "@/features/navigation/Sidebar";
import { styles } from "./AppShell.styles";

/**
 * Every page: the sidebar with the lessons, and the page itself. On narrow
 * screens the sidebar slides in from a menu button in a sticky top bar.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const course = useCourse();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div {...stylex.props(styles.app)}>
      <header {...stylex.props(styles.topBar)}>
        <BrandMark topic={course.topic} />
        <button
          type="button"
          aria-expanded={menuOpen}
          aria-controls="sidebar"
          onClick={() => setMenuOpen((open) => !open)}
          {...stylex.props(styles.menuButton)}
        >
          {menuOpen ? "close" : "lessons/"}
        </button>
      </header>

      <aside id="sidebar" {...stylex.props(styles.sidebar, menuOpen && styles.sidebarOpen)}>
        <Sidebar onNavigate={() => setMenuOpen(false)} />
      </aside>

      <main {...stylex.props(styles.main)}>
        <div>{children}</div>
      </main>
    </div>
  );
}
