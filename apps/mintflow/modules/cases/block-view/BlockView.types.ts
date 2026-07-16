import type { WorkCase, WorkFile } from "../module.api";

export interface BlockViewProps {
  cases: WorkCase[];
  files: WorkFile[];
  onOpenCase: (workCase: WorkCase) => void;
  onOpenFile: (file: WorkFile) => void;
}
