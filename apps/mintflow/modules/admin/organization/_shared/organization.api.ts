import api from "@/lib/api";

import type {
  OrganizationListResponse,
  OrganizationUnit,
  UnitTreeNode,
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
 * Nested unit tree for a single organization — shared between the
 * Overview screen's setup-progress check and the Structure Builder canvas.
 */
export async function fetchUnitTree(
  organizationId: string,
): Promise<UnitTreeNode[]> {
  const { data } = await api.get<{ data: UnitTreeNode[] }>(
    `/api/v1/organization/organizations/${organizationId}/unit-tree/`,
  );
  return data.data;
}
