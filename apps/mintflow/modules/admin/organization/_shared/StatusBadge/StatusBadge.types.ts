import type {
  AssignmentStatus,
  DelegationStatus,
  MembershipStatus,
  OrganizationEventType,
  OrganizationStatus,
  PositionStatus,
  UnitStatus,
} from "../../organization.types";

export type StatusBadgeVariant =
  | OrganizationStatus
  | UnitStatus
  | PositionStatus
  | MembershipStatus
  | AssignmentStatus
  | DelegationStatus
  | OrganizationEventType
  | string;

export interface StatusBadgeProps {
  status: StatusBadgeVariant;
  label?: string;
  size?: "xs" | "sm" | "md" | "lg";
}
