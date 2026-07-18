import type { WorkItem } from "@/lib/work";

export interface ListViewProps {
  cases: WorkItem[];
  onOpenCase: (workCase: WorkItem) => void;
}
