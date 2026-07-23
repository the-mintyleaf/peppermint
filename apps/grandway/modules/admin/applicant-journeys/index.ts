export { ModuleJourneyWorklist } from "./pages/list/JourneyWorklist";
export { ModuleJourneyDetail } from "./pages/detail/JourneyDetail";

// Exported for cross-module reuse (e.g. a future Applicant Detail →
// Journeys panel) — see this module's build report for the exact shape.
export { useJourneyList } from "./applicantJourneys.hooks";
export { JourneyForm } from "./form";
export type { JourneyFormProps, JourneyFormValues } from "./form";
export type {
  ApplicantJourney,
  ApplicantJourneyDetail,
  JourneyStage,
  SelectableJourneyStage,
} from "./applicantJourneys.types";
