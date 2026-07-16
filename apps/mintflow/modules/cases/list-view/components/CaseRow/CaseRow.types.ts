import type { WorkCase } from "../../../module.api";

export interface CaseRowProps {
  workCase: WorkCase;
  onOpen: (workCase: WorkCase) => void;
}
