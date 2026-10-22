import { createFileRoute } from "@tanstack/react-router";
import { ExplorerPage } from "@/courses/ast/features/explorer/ExplorerPage";
import { course } from "@/app/course";

interface ExplorerSearch {
  code?: string;
}

export const Route = createFileRoute("/explorer")({
  validateSearch: (search: Record<string, unknown>): ExplorerSearch =>
    typeof search.code === "string" ? { code: search.code } : {},
  head: () => ({
    meta: [
      { title: `The Explorer · ${course.title}` },
      { name: "description", content: "Write any JavaScript and inspect its full abstract syntax tree." },
    ],
  }),
  component: ExplorerRoute,
});

function ExplorerRoute() {
  const { code } = Route.useSearch();
  return <ExplorerPage code={code} />;
}
