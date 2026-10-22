import type { ReactNode } from "react";
import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { course } from "@/app/course";
import appCss from "@/design/global.css?url";
import { CourseProvider } from "@/features/course";
import { AppShell } from "@/features/navigation/AppShell";
import { NotFound } from "@/features/navigation/NotFound";
import { themeScript } from "@/features/theme/themeScript";

// In development StyleX serves its CSS from a virtual endpoint, with a small runtime
// that refetches it on every change. A build appends it to global.css instead.
const devStyleX = import.meta.env.DEV
  ? {
      links: [{ rel: "stylesheet", href: `${import.meta.env.BASE_URL}virtual:stylex.css` }],
      scripts: [{ type: "module", src: `${import.meta.env.BASE_URL}@id/virtual:stylex:runtime` }],
    }
  : { links: [], scripts: [] };

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: course.title },
      { name: "description", content: course.description },
    ],
    links: [{ rel: "stylesheet", href: appCss }, ...devStyleX.links],
    scripts: [{ children: themeScript }, ...devStyleX.scripts],
  }),
  shellComponent: RootDocument,
  component: RootLayout,
  notFoundComponent: NotFound,
});

/** The HTML document around every page, prerendered at build time. */
function RootDocument({ children }: { children: ReactNode }) {
  return (
    // The theme script may set data-theme before React hydrates.
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootLayout() {
  return (
    <CourseProvider course={course}>
      <AppShell>
        <Outlet />
      </AppShell>
    </CourseProvider>
  );
}
