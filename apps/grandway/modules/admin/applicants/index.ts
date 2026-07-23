export { ModuleApplicantsList } from "./pages/list/ApplicantsList";
export { ModuleApplicantCreate } from "./pages/new/ApplicantCreatePage";
export { ModuleApplicantDetail } from "./pages/detail/ApplicantDetail";
export { ModuleApplicantEdit } from "./pages/edit/ApplicantEditPage";

// Exported for cross-module reuse (e.g. the applicant picker in
// applicant-journeys' `JourneyForm`).
export { useApplicantList, useApplicantDetail } from "./applicants.hooks";
export type { Applicant, ApplicantDetail } from "./applicants.types";
