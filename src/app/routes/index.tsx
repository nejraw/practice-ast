import { createFileRoute } from "@tanstack/react-router";
import { ContentsPage } from "@/features/contents/ContentsPage";

export const Route = createFileRoute("/")({
  component: ContentsPage,
});
