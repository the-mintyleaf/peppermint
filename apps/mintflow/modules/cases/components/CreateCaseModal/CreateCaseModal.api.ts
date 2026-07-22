/**
 * Reference-data fetchers for the New Case form. Work create needs two required
 * UUIDs — `organization` and `responsible_unit` — plus an optional owner for the
 * assignment-routing path. Those come from the `organization` and `auth` read
 * surfaces (the same ones `lib/work/directory.ts` already resolves names from,
 * see `docs/api-contracts/work.reshape.md` §2), never from the `work` domain.
 *
 * All three are paginated list endpoints, so the api-client interceptor keeps
 * the `{ data, meta }` envelope — read `data.data`, not the bare body.
 */

import api from "@/lib/api";

/** Minimal organization shape needed to render an org option. */
export interface RefOrganization {
  id: string;
  name_np: string;
  name_en: string;
  code: string;
}

/** Minimal unit shape needed to render a responsible-unit / target-unit option. */
export interface RefUnit {
  id: string;
  name_np: string;
  name_en: string;
  code: string;
}

/** Minimal person shape needed to render a proposed-owner option. */
export interface RefUser {
  id: string;
  username: string;
  display_name: string;
}

/** Paginated list envelope preserved by the interceptor (`meta.count` present). */
interface ListEnvelope<T> {
  data: T[];
  meta: { count: number };
}

const LIST_PAGE_SIZE = 200;

/** All organizations the caller can see (first page, capped). */
export async function fetchOrganizations(): Promise<RefOrganization[]> {
  const { data } = await api.get<ListEnvelope<RefOrganization>>(
    "/api/v1/organization/organizations/",
    { params: { page_size: LIST_PAGE_SIZE } },
  );
  return data.data;
}

/** Flat unit list for one organization — same collection the structure builder reads. */
export async function fetchUnitsForOrg(orgId: string): Promise<RefUnit[]> {
  const { data } = await api.get<ListEnvelope<RefUnit>>(
    `/api/v1/organization/organizations/${orgId}/units/`,
    { params: { page_size: LIST_PAGE_SIZE } },
  );
  return data.data;
}

/** Assignable actors for the proposed-owner picker (first page, capped). */
export async function fetchAssignableUsers(): Promise<RefUser[]> {
  const { data } = await api.get<ListEnvelope<RefUser>>("/api/v1/auth/users/", {
    params: { page_size: LIST_PAGE_SIZE },
  });
  return data.data;
}
