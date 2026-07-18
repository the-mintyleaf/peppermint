import type { ApplicantListRow } from "@/modules/admin/applicant/_shared/applicant.types";

/** The "what changed" feed — most-recently-updated applicants. */
export interface RecentApplicantsProps {
  rows: ApplicantListRow[] | undefined;
  now: number;
  isLoading?: boolean;
  isError?: boolean;
  onRetry: () => void;
  isRetrying?: boolean;
}
