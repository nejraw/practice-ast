import { createContext } from "react";
import type { Source } from "@/features/course";

/** The current lesson's sources, so `<Cite>` can number its reference. */
export const SourcesContext = createContext<Source[]>([]);

/** Where a source is listed on the page. */
export const sourceAnchor = (id: string) => `source-${id}`;
