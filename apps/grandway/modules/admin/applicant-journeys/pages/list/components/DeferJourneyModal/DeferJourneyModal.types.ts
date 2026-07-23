import type { ApplicantJourney } from "../../../../applicantJourneys.types";

export interface DeferJourneyModalProps {
  journey: ApplicantJourney;
  opened: boolean;
  onClose: () => void;
}
