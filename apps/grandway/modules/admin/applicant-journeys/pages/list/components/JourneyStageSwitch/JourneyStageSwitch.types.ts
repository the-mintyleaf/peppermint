import type { ApplicantJourney } from "../../../../applicantJourneys.types";

export interface JourneyStageSwitchProps {
  journey: ApplicantJourney;
  /**
   * Stretch the pill to its container. Defaults to `true` for the table cell;
   * the detail-page header passes `false` so it sizes to its own label.
   */
  fullWidth?: boolean;
}
