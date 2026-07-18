import type { ApplicantListRow } from "@/modules/admin/applicant/_shared/applicant.types";

/**
 * The follow-up attention queue. `rows` are already filtered to overdue / due-today and
 * sorted soonest-first by the parent. `now` is passed in so date math is deterministic
 * and the component stays pure.
 */
export interface AttentionListProps {
  rows: ApplicantListRow[];
  now: number;
  isLoading?: boolean;
  isError?: boolean;
  onRetry: () => void;
  isRetrying?: boolean;
}
