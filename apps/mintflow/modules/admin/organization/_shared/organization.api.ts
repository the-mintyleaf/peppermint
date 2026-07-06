import api from "@/lib/api";

import type {
  OrganizationListResponse,
  OrganizationUnit,
  UnitTreeNodeFlat,
} from "./organization.types";

/**
 * Flat unit list for a single organization — backs `UnitPickerSelect`.
 * Real endpoint (`GET /organizations/<id>/units/`) is the same list/create
 * collection the structure builder posts to; this only ever reads.
 */
export async function fetchUnitsFlat(
  organizationId: string,
): Promise<OrganizationUnit[]> {
  const { data } = await api.get<OrganizationListResponse<OrganizationUnit>>(
    `/api/v1/organization/organizations/${organizationId}/units/`,
    { params: { page_size: 200 } },
  );
  return data.data;
}

/**
 * Top-level (root) units for an organization — the initial render of the
 * Structure Builder and the Overview setup-progress check. `max_depth=0`
 * returns only depth-0 units; children are loaded lazily on expand.
 *
 * No `status` filter: the builder is an editing surface, so it must show units
 * in every state — freshly-created units are `draft`, and filtering to `active`
 * would hide exactly the units the admin just added.
 */
export async function fetchUnitRoots(
  organizationId: string,
): Promise<UnitTreeNodeFlat[]> {
  // The response interceptor (`lib/api.ts`) already unwraps the `{success,data,meta}`
  // envelope for non-paginated responses (this endpoint's `meta` has no `count`), so
  // `data` is the array itself — do NOT read `data.data` (that would double-unwrap to
  // `undefined`, which makes React Query throw).
  const { data } = await api.get<UnitTreeNodeFlat[]>(
    `/api/v1/organization/organizations/${organizationId}/unit-tree-nodes/`,
    { params: { max_depth: 0 } },
  );
  return data;
}

/**
 * One level of a unit's subtree, with members — backs a single expand.
 * `root_unit_id` + `max_depth=1` returns the unit itself (depth 0, carrying its
 * own `positions`) plus its direct children (depth 1, each with `positions`).
 * Unfiltered by status, to match `fetchUnitRoots` (see note there).
 */
export async function fetchUnitChildren(
  organizationId: string,
  unitId: string,
): Promise<UnitTreeNodeFlat[]> {
  // Already-unwrapped by the response interceptor — return `data`, not `data.data`.
  const { data } = await api.get<UnitTreeNodeFlat[]>(
    `/api/v1/organization/organizations/${organizationId}/unit-tree-nodes/`,
    {
      params: {
        root_unit_id: unitId,
        max_depth: 1,
        include_members: true,
      },
    },
  );
  return data;
}
