import { createFileRoute } from "@tanstack/react-router";
import { NotFound } from "@/features/navigation/NotFound";

// Any path no other route knows. It's prerendered as 404.html (see vite.config.ts),
// which GitHub Pages serves for unknown paths; because the browser then matches
// this same route, the page hydrates exactly as it was rendered.
export const Route = createFileRoute("/$")({
  component: NotFound,
});
