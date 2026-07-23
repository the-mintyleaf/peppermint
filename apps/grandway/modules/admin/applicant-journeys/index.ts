export { ModuleJourneyWorklist } from "./pages/list/JourneyWorklist";
export { ModuleJourneyDetail } from "./pages/detail/JourneyDetail";

// Public API for cross-module reuse. `ApplicantJourneysPanel` (in the
// `applicants` module) imports these from their concrete files rather than
// this barrel, to avoid a barrel-to-barrel import cycle with `applicants`
// (whose barrel pulls in that panel) — this export list is for any other
// future consumer that doesn't have that constraint.
export { useJourneyList, useCreateJourney } from "./applicantJourneys.hooks";
export { JourneyForm, toJourneyPayload } from "./form";
export type { JourneyFormProps, JourneyFormValues } from "./form";
export type {
  ApplicantJourney,
  ApplicantJourneyDetail,
  JourneyStage,
  SelectableJourneyStage,
} from "./applicantJourneys.types";
export { STAGE_COLORS, STAGE_LABELS } from "./applicantJourneys.labels";
