import type { MembershipStatus } from "../organization.types";

export type { MembershipStatus };

export interface Person extends Record<string, unknown> {
  id: string;
  organization: string;
  user_id: string;
  user_display_name: string;
  user_email: string;
  employee_code: string;
  membership_status: MembershipStatus;
  joined_at: string | null;
  ended_at: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface PeopleFetchResponse {
  data: Person[];
  meta: { total: number; page: number; pageSize: number };
}

export interface UnitMembershipSummary {
  id: string;
  unit_id: string;
  unit_name: string;
  unit_code: string;
  membership_type: string;
  status: string;
  is_primary: boolean;
  valid_from: string | null;
  valid_to: string | null;
}

export interface PositionAssignmentSummary {
  id: string;
  position_id: string;
  position_title: string;
  position_code: string;
  assignment_type: string;
  status: string;
  is_primary: boolean;
  starts_at: string | null;
  ends_at: string | null;
}

export interface PersonDetail extends Person {
  unit_memberships: UnitMembershipSummary[];
  position_assignments: PositionAssignmentSummary[];
}

export interface CreatePersonPayload {
  user_id: string;
  employee_code: string;
  joined_at: string | null;
  is_primary: boolean;
}

export interface ChangeMembershipStatusPayload {
  status: MembershipStatus;
  reason: string;
}

export interface UserSearchResult {
  id: string;
  display_name: string;
  email: string;
}
