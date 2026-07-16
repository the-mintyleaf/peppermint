import type { WorkFile } from "../../module.api";

export interface WorkFilesRailProps {
  files: WorkFile[];
  onOpenFile: (file: WorkFile) => void;
  onViewAll: () => void;
}
