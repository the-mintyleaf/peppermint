import type { ApplicantDetail, UserBrief } from "../../../../applicants.types";

export interface ApplicantAssigneeControlProps {
  applicant: ApplicantDetail;
}

export interface AssigneeFactProps {
  /** "You", the assignee's name, or "nobody". */
  label: string;
  /** Why there is no lever here — shown on hover/focus, read by screen readers. */
  reason?: string;
}

export interface AdminAssigneeMenuProps {
  applicantId: string;
  assignee: UserBrief | null;
  /** The signed-in Admin's own id — the "Me" choice. */
  myId: string;
  label: string;
}

export interface SelfAssignButtonProps {
  applicantId: string;
  /** The signed-in Lead Manager's own id — sent on Take (no `me` shorthand). */
  myId: string;
  mode: "take" | "release";
}
