import type { ApplicantListRow } from "../../../../../_shared";

/** Which lifecycle dimension the switch drives. */
export type LifecycleField = "stage" | "engagement";

export interface ApplicantLifecycleSwitchProps {
  applicant: ApplicantListRow;
  /** `"stage"` drives `lifecycle_stage`; `"engagement"` drives `engagement_status`. */
  field: LifecycleField;
  /**
   * Only admins get the interactive switch — staff (and archived/terminal records) fall
   * back to a read-only badge, mirroring the admin-only "Change lifecycle" row action.
   */
  isAdmin: boolean;
}
