import api from "@/lib/api";

import type { MyMembership } from "./Invitations.types";

/**
 * The authenticated user's own memberships (self-scoped by the access token),
 * optionally filtered by status. Small non-paginated list — the response
 * interceptor unwraps the envelope to the array; the guard tolerates either shape.
 */
export async function fetchMyMemberships(
  status?: MyMembership["membership_status"],
): Promise<MyMembership[]> {
  const { data } = await api.get(`/api/v1/organization/memberships/mine/`, {
    params: status ? { status } : undefined,
  });
  return Array.isArray(data) ? data : (data?.data ?? []);
}

export async function acceptMembership(membershipId: string): Promise<void> {
  await api.post(`/api/v1/organization/memberships/${membershipId}/accept/`);
}

export async function declineMembership(
  membershipId: string,
  reason?: string,
): Promise<void> {
  await api.post(`/api/v1/organization/memberships/${membershipId}/decline/`, {
    reason,
  });
}
