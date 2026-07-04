import type { QueryParams } from "@peppermint/admin";

import api from "@/lib/api";

import type { OrganizationListResponse } from "../_shared/organization.types";
import type {
  AssignmentType,
  MembershipStatus,
  OrganizationMembership,
  PositionAssignment,
  UnitMembership,
} from "./members.types";

export async function fetchMemberships(
  organizationId: string,
  params?: QueryParams,
): Promise<OrganizationListResponse<OrganizationMembership>> {
  const { data } = await api.get(
    `/api/v1/organization/organizations/${organizationId}/memberships/`,
    {
      params: {
        page: params?.page,
        page_size: params?.pageSize,
        search: params?.search || undefined,
        ...params?.filters,
      },
    },
  );
  return { data: data.data, meta: { ...data.meta, total: data.meta.count } };
}

export async function fetchMembership(
  membershipId: string,
): Promise<OrganizationMembership> {
  const { data } = await api.get(
    `/api/v1/organization/memberships/${membershipId}/`,
  );
  return data;
}

export interface CreateMembershipPayload {
  user_id: string;
  employee_code?: string;
  joined_at?: string | null;
  is_primary?: boolean;
}

export async function createMembership(
  organizationId: string,
  values: CreateMembershipPayload,
): Promise<OrganizationMembership> {
  const { data } = await api.post(
    `/api/v1/organization/organizations/${organizationId}/memberships/`,
    values,
  );
  return data;
}

export interface ChangeMembershipStatusPayload {
  status: MembershipStatus;
  reason: string;
}

export async function changeMembershipStatus(
  membershipId: string,
  payload: ChangeMembershipStatusPayload,
): Promise<OrganizationMembership> {
  const { data } = await api.patch(
    `/api/v1/organization/memberships/${membershipId}/status/`,
    payload,
  );
  return data;
}

/**
 * Not documented in the organization API — inferred from the sibling
 * `PATCH /api/v1/auth/users/<id>/` endpoint already used by
 * `modules/admin/authenticate/users/users.api.ts`, which implies the
 * matching `GET` retrieve action exists on the same route.
 */
export interface UserSummary {
  id: string;
  username: string;
  display_name: string;
  email: string | null;
}

export async function fetchUserSummary(userId: string): Promise<UserSummary> {
  const { data } = await api.get(`/api/v1/auth/users/${userId}/`);
  return data;
}

export async function fetchUnitMemberships(
  membershipId: string,
): Promise<UnitMembership[]> {
  const { data } = await api.get<{ data: UnitMembership[] }>(
    `/api/v1/organization/memberships/${membershipId}/unit-memberships/`,
  );
  return data.data;
}

export interface CreateUnitMembershipPayload {
  unit_id: string;
  membership_type?: string;
  is_primary?: boolean;
  valid_from?: string | null;
  valid_to?: string | null;
  reason?: string;
}

export async function createUnitMembership(
  membershipId: string,
  values: CreateUnitMembershipPayload,
): Promise<UnitMembership> {
  const { data } = await api.post(
    `/api/v1/organization/memberships/${membershipId}/unit-memberships/`,
    values,
  );
  return data;
}

export async function endUnitMembership(
  unitMembershipId: string,
  payload: { reason?: string },
): Promise<UnitMembership> {
  const { data } = await api.post(
    `/api/v1/organization/unit-memberships/${unitMembershipId}/end/`,
    payload,
  );
  return data;
}

export async function fetchPositionAssignments(
  membershipId: string,
): Promise<PositionAssignment[]> {
  const { data } = await api.get<{ data: PositionAssignment[] }>(
    `/api/v1/organization/memberships/${membershipId}/position-assignments/`,
  );
  return data.data;
}

export interface CreatePositionAssignmentPayload {
  position_id: string;
  assignment_type: AssignmentType;
  status?: PositionAssignment["status"];
  starts_at?: string | null;
  ends_at?: string | null;
  is_primary?: boolean;
  reason?: string;
}

export async function createPositionAssignment(
  membershipId: string,
  values: CreatePositionAssignmentPayload,
): Promise<PositionAssignment> {
  const { data } = await api.post(
    `/api/v1/organization/memberships/${membershipId}/position-assignments/`,
    values,
  );
  return data;
}

export async function endPositionAssignment(
  assignmentId: string,
  payload: { reason?: string },
): Promise<PositionAssignment> {
  const { data } = await api.post(
    `/api/v1/organization/position-assignments/${assignmentId}/end/`,
    payload,
  );
  return data;
}

export interface TransferPositionAssignmentPayload {
  new_position_id: string;
  reason: string;
}

export async function transferPositionAssignment(
  assignmentId: string,
  payload: TransferPositionAssignmentPayload,
): Promise<PositionAssignment> {
  const { data } = await api.post(
    `/api/v1/organization/position-assignments/${assignmentId}/transfer/`,
    payload,
  );
  return data;
}
