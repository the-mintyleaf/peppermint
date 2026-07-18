import type { WorkItem } from "@/lib/work";

export interface BlockViewProps {
  cases: WorkItem[];
  onOpenCase: (workCase: WorkItem) => void;
}
