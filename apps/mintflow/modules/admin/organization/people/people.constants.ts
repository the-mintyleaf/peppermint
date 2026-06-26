import type { MembershipStatus } from "../organization.types";
import { MEMBERSHIP_STATUS_LABELS } from "../organization.constants";

export const MEMBERSHIP_STATUS_TRANSITIONS: Record<
  MembershipStatus,
  MembershipStatus[]
> = {
  invited: ["active", "ended", "archived"],
  active: ["inactive", "suspended", "ended", "archived"],
  inactive: ["active", "ended", "archived"],
  suspended: ["active", "inactive", "ended", "archived"],
  transferred: ["ended", "archived"],
  ended: [],
  archived: [],
};

/** Task-verb labels for status change actions (DESIGN.md — labels name the consequence). */
export const MEMBERSHIP_STATUS_ACTION_LABELS: Record<MembershipStatus, string> =
  {
    invited: "Mark as Invited",
    active: "Activate",
    inactive: "Mark Inactive",
    suspended: "Suspend",
    transferred: "Mark Transferred",
    ended: "End Membership",
    archived: "Archive",
  };

export const MEMBERSHIP_STATUS_REQUIRES_REASON: MembershipStatus[] = [
  "suspended",
  "ended",
  "archived",
];

export function getMembershipStatusActionLabel(
  status: MembershipStatus,
): string {
  return (
    MEMBERSHIP_STATUS_ACTION_LABELS[status] ??
    MEMBERSHIP_STATUS_LABELS[status] ??
    status
  );
}
