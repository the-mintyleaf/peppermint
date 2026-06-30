import api from "@/lib/api";
import type { QueryParams } from "@peppermint/admin";
import type { UserPickerOption } from "../_shared/UserPicker/UserPicker.types";
import type {
  ChangeMembershipStatusPayload,
  CreatePersonPayload,
  PeopleFetchResponse,
  Person,
  PositionAssignmentSummary,
  UnitMembershipSummary,
} from "./people.types";

export async function fetchPeople(
  orgId: string,
  params?: QueryParams,
): Promise<PeopleFetchResponse> {
  const res = await api.get(
    `/api/v1/organization/organizations/${orgId}/memberships/`,
    {
      params: {
        page: params?.page ?? 1,
        page_size: params?.pageSize ?? 20,
        search: params?.search,
        membership_status: params?.filters?.membership_status,
      },
    },
  );
  const d = res.data;
  return {
    data: d.data ?? d.results ?? d,
    meta: {
      total: d.meta?.count ?? d.count ?? 0,
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 20,
    },
  };
}

export async function createPerson(
  orgId: string,
  values: CreatePersonPayload,
): Promise<Person> {
  const res = await api.post(
    `/api/v1/organization/organizations/${orgId}/memberships/`,
    values,
  );
  return res.data;
}

export async function fetchPerson(id: string): Promise<Person> {
  const res = await api.get(`/api/v1/organization/memberships/${id}/`);
  return res.data;
}

export async function fetchUnitMemberships(
  membershipId: string,
): Promise<UnitMembershipSummary[]> {
  const res = await api.get(
    `/api/v1/organization/memberships/${membershipId}/unit-memberships/`,
  );
  const d = res.data;
  return d.data ?? d.results ?? d ?? [];
}

export async function fetchPositionAssignments(
  membershipId: string,
): Promise<PositionAssignmentSummary[]> {
  const res = await api.get(
    `/api/v1/organization/memberships/${membershipId}/position-assignments/`,
  );
  const d = res.data;
  return d.data ?? d.results ?? d ?? [];
}

export async function changeMembershipStatus(
  id: string,
  payload: ChangeMembershipStatusPayload,
): Promise<Person> {
  const res = await api.patch(
    `/api/v1/organization/memberships/${id}/status/`,
    payload,
  );
  return res.data;
}

export async function searchUsers(search: string): Promise<UserPickerOption[]> {
  const res = await api.get("/api/v1/auth/users/", { params: { search } });
  const d = res.data;
  const items: Array<Record<string, unknown>> = d.data ?? d.results ?? d ?? [];
  return items.map((u) => ({
    id: String(u.id),
    fullName: String(u.display_name ?? u.username ?? ""),
    email: String(u.email ?? ""),
  }));
}
