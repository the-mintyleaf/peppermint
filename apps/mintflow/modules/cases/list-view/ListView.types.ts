import type { CaseFile, WorkCase } from "../module.api";

export interface ListViewProps {
  cases: WorkCase[];
  files: CaseFile[];
  onOpenCase: (workCase: WorkCase) => void;
  onOpenFile: (file: CaseFile) => void;
}
