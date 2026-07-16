import type { CaseFile } from "../../../module.api";

export interface FileRowProps {
  file: CaseFile;
  onOpen: (file: CaseFile) => void;
}
