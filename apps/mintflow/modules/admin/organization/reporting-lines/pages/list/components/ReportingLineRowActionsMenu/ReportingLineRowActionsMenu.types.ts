import type { ReportingLine } from "../../../../reportingLines.types";

export interface ReportingLineRowActionsMenuProps {
  reportingLine: ReportingLine;
  onViewChain: (reportingLine: ReportingLine) => void;
}
