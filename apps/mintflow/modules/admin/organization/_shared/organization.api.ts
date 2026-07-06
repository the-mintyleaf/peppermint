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
 */
export async function fetchUnitRoots(
  organizationId: string,
): Promise<UnitTreeNodeFlat[]> {
  const { data } = await api.get<{ data: UnitTreeNodeFlat[] }>(
    `/api/v1/organization/organizations/${organizationId}/unit-tree-nodes/`,
    { params: { status: "active", max_depth: 0 } },
  );
  return data.data;
}

/**
 * One level of a unit's subtree, with members — backs a single expand.
 * `root_unit_id` + `max_depth=1` returns the unit itself (depth 0, carrying its
 * own `positions`) plus its direct children (depth 1, each with `positions`).
 */
export async function fetchUnitChildren(
  organizationId: string,
  unitId: string,
): Promise<UnitTreeNodeFlat[]> {
  const { data } = await api.get<{ data: UnitTreeNodeFlat[] }>(
    `/api/v1/organization/organizations/${organizationId}/unit-tree-nodes/`,
    {
      params: {
        root_unit_id: unitId,
        max_depth: 1,
        include_members: true,
      },
    },
  );
  return data.data;
}
