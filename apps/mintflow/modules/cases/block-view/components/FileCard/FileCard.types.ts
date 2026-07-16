import type { WorkFile } from "../../../module.api";

export interface FileCardProps {
  file: WorkFile;
  onOpen: (file: WorkFile) => void;
}
