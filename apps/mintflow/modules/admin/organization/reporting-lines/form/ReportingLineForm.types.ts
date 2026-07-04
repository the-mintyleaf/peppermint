import type { ModalFormComponentProps } from "@peppermint/admin";

import type { ReportingLine, ReportingLineType } from "../reportingLines.types";

export type ReportingLineFormProps = ModalFormComponentProps<ReportingLine>;

export interface ReportingLineFormValues {
  source_position_id: string | null;
  target_position_id: string | null;
  reporting_line_type: ReportingLineType | "";
  is_primary: boolean;
  reason: string;
}
