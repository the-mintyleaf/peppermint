import type { ApplicantJourney } from "../../../../applicantJourneys.types";

export interface ReopenJourneyModalProps {
  journey: ApplicantJourney;
  opened: boolean;
  onClose: () => void;
}
