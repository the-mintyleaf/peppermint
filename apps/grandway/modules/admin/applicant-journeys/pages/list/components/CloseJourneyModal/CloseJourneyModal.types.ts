import type { ApplicantJourney } from "../../../../applicantJourneys.types";

export interface CloseJourneyModalProps {
  journey: ApplicantJourney;
  opened: boolean;
  onClose: () => void;
}
