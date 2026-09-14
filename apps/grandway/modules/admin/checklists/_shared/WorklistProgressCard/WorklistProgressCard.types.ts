import type { ChecklistProgress } from "../../checklists.types";

export interface WorklistProgressCardProps {
  /** The server's own counts — never recomputed from items, so the card can't disagree with them. */
  progress: ChecklistProgress;
  /** Card heading. Defaults to "Journey progress overview". */
  title?: string;
}
