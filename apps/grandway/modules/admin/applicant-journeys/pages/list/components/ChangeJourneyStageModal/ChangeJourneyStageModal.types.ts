import type { ApplicantJourney } from "../../../../applicantJourneys.types";

export interface ChangeJourneyStageModalProps {
  journey: ApplicantJourney;
  opened: boolean;
  onClose: () => void;
}
