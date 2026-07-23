import type { ApplicantJourney } from "../../../../applicantJourneys.types";

export interface JourneyRowActionsMenuProps {
  journey: ApplicantJourney;
  onViewDetails: (journey: ApplicantJourney) => void;
}
