import { createQueryKeys } from "@peppermint/admin";

/**
 * Array-form query keys for every applicant resource (never stringly-typed).
 * Child-resource keys are namespaced by the parent applicant id at the call site
 * via `.list({ applicantId })` / `.detail(id)`.
 */
export const applicantKeys = createQueryKeys("applicant.applicants");
export const addressKeys = createQueryKeys("applicant.addresses");
export const lifecycleHistoryKeys = createQueryKeys(
  "applicant.lifecycle-history",
);
export const lockHistoryKeys = createQueryKeys("applicant.lock-history");
export const mergeHistoryKeys = createQueryKeys("applicant.merge-history");
export const mediaKeys = createQueryKeys("applicant.media");
export const profileImageKeys = createQueryKeys("applicant.profile-image");
export const interestProfileKeys = createQueryKeys(
  "applicant.interest-profile",
);
export const assessmentKeys = createQueryKeys(
  "applicant.qualification-assessments",
);
export const caseKeys = createQueryKeys("applicant.cases");
export const caseStatusHistoryKeys = createQueryKeys(
  "applicant.case-status-history",
);
export const assignmentKeys = createQueryKeys("applicant.assignments");

/**
 * A per-slug query-key factory for the generic child resources (§5, §8). Keeps each
 * child's keys array-form and namespaced by its slug.
 */
export function childKeys(slug: string) {
  return createQueryKeys(`applicant.child.${slug}`);
}
