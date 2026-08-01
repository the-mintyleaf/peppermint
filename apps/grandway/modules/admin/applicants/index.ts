export { ModuleApplicantsList } from "./pages/list/ApplicantsList";
export { ModuleApplicantCreate } from "./pages/new/ApplicantCreatePage";
export { ModuleApplicantDetail } from "./pages/detail/ApplicantDetail";
export { ModuleApplicantEdit } from "./pages/edit/ApplicantEditPage";

// Exported for cross-module reuse (e.g. the applicant picker in
// applicant-journeys' `JourneyForm`).
export { useApplicantList, useApplicantDetail } from "./applicants.hooks";
export type { Applicant, ApplicantDetail } from "./applicants.types";

// The photograph (an `uploaded_files` row, not a field on the applicant) is
// deliberately NOT re-exported here. Journeys, offers and the document editor
// all show a face, and every one of them must import it from
// `applicants/photograph` directly — this barrel pulls in `ApplicantDetail` →
// `ApplicantJourneysPanel` → the applicant-journeys barrel, so a cross-module
// consumer reaching for it through here would close exactly the import cycle
// the Applicants ⇄ Journeys rule in `docs/AI.md` exists to prevent. The
// sub-barrel depends only on `uploaded-files`, so it is safe from anywhere.
