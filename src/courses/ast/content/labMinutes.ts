import type { LabMinutes } from "@/features/progress/readingTime";

// Figures that invite writing or stepping through code take longer than the
// usual minute and a half. Read at build time by the lesson-times plugin.
export const labMinutes: LabMinutes = {
  RuleLab: 4,
  ParseStepper: 3,
  TransformPlayground: 3,
  TypeStripper: 3,
  RunTheTree: 2,
};
