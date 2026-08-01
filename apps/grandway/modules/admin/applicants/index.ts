export { ModuleApplicantsList } from "./pages/list/ApplicantsList";
export { ModuleApplicantCreate } from "./pages/new/ApplicantCreatePage";
export { ModuleApplicantDetail } from "./pages/detail/ApplicantDetail";
export { ModuleApplicantEdit } from "./pages/edit/ApplicantEditPage";

// Exported for cross-module reuse (e.g. the applicant picker in
// applicant-journeys' `JourneyForm`).
export { useApplicantList, useApplicantDetail } from "./applicants.hooks";
export type { Applicant, ApplicantDetail } from "./applicants.types";

// The photograph lives in `uploaded_files`, not on the applicant record, so
// every surface that shows a face (journeys, offers, the document editor and
// its CV/certificate templates) reads it through here rather than re-deriving
// "which file is the photo" for itself.
export {
  ApplicantPhoto,
  ApplicantPhotoField,
  useApplicantPhotograph,
  useSaveApplicantPhotograph,
  type ApplicantPhotoProps,
  type ApplicantPhotoFieldProps,
} from "./photograph";
