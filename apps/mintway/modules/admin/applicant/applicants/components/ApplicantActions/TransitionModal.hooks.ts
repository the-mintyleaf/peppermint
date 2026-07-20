"use client";

import { useQuery } from "@tanstack/react-query";
import { dayjs } from "@peppermint/ui";

import {
  applicantKeys,
  ELIGIBILITY_RESULT_LABELS,
  fetchQualificationAssessments,
  getApplicant,
} from "../../../_shared";
import type { QualificationAssessment } from "../../../_shared";

function assessmentLabel(a: QualificationAssessment): string {
  const date =
    a.assessment_date && dayjs(a.assessment_date).isValid()
      ? dayjs(a.assessment_date).format("MMM D, YYYY")
      : "No date";
  const eligibility = a.eligibility_result
    ? ELIGIBILITY_RESULT_LABELS[a.eligibility_result]
    : "—";
  return `${date} · ${eligibility}${a.is_current ? " · Current" : ""}`;
}

/**
 * Load the applicant's qualification assessments as `Select` options (id → readable
 * label) for the transition modal. The `→ potential` move needs a real assessment id of
 * this applicant, so we offer the actual records instead of a hand-typed UUID (§9.1).
 * Only fetches while `enabled`, so the query stays idle until the modal needs it.
 */
export function useAssessmentOptions(applicantId: string, enabled: boolean) {
  const query = useQuery({
    queryKey: [
      "applicant.child.qualification-assessments",
      "options",
      applicantId,
    ],
    queryFn: () =>
      fetchQualificationAssessments(applicantId, { pageSize: 100 }),
    enabled,
  });

  const options = (query.data?.data ?? []).map((a) => ({
    value: a.id,
    label: assessmentLabel(a),
  }));

  return { options, isLoading: query.isLoading, isError: query.isError };
}

/**
 * Resolve the applicant's current `record_version` for the transition payload. The staff
 * list projection omits `record_version`, and the server increments it after every
 * transition — so a value carried on a table row is either absent (→ "This field is
 * required") or stale (→ `VersionConflictError`). We refetch the detail (sharing the
 * `applicantKeys.detail` cache the transition mutation already invalidates) and use its
 * fresh value, falling back to the passed-in version only while the refetch is in flight.
 */
export function useApplicantRecordVersion(
  applicantId: string,
  enabled: boolean,
) {
  const query = useQuery({
    queryKey: applicantKeys.detail(applicantId),
    queryFn: () => getApplicant(applicantId),
    enabled,
  });

  return {
    recordVersion: query.data?.record_version,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
