import type { Applicant } from "../../../../applicants.types";

export interface ApplicantStatusSwitchProps {
  applicant: Applicant;
  /**
   * Stretch the pill to its container. Defaults to `true` for the table cell;
   * the detail-page header passes `false` so it sizes to its own label.
   */
  fullWidth?: boolean;
}
