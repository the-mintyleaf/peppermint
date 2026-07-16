import type { WorkCase } from "../../../module.api";

export interface CaseCardProps {
  workCase: WorkCase;
  onOpen: (workCase: WorkCase) => void;
}
