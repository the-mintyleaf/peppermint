import type { WorkFile } from "../../../../module.api";

export interface WorkFileCardProps {
  file: WorkFile;
  onOpenFile: (file: WorkFile) => void;
}
