import api from "@/lib/api";

import type { OrganizationUnit, UnitType } from "../_shared/organization.types";

export async function fetchUnitDetail(
  unitId: string,
): Promise<OrganizationUnit> {
  const { data } = await api.get(`/api/v1/organization/units/${unitId}/`);
  return data;
}

export interface CreateUnitPayload {
  name: string;
  code: string;
  unit_type: UnitType;
  parent: string | null;
  description?: string;
  sort_order?: number;
  is_operational?: boolean;
}

export async function createUnit(
  organizationId: string,
  payload: CreateUnitPayload,
): Promise<OrganizationUnit> {
  const { data } = await api.post(
    `/api/v1/organization/organizations/${organizationId}/units/`,
    payload,
  );
  return data;
}

/** Never send `code` or `parent` through this endpoint — use `moveUnit` for re-parenting. */
export interface UpdateUnitPayload {
  name?: string;
  unit_type?: UnitType;
  status?: OrganizationUnit["status"];
  description?: string;
  sort_order?: number;
  is_operational?: boolean;
}

export async function updateUnit(
  unitId: string,
  payload: UpdateUnitPayload,
): Promise<OrganizationUnit> {
  const { data } = await api.patch(
    `/api/v1/organization/units/${unitId}/`,
    payload,
  );
  return data;
}

export interface MoveUnitPayload {
  new_parent: string | null;
  reason: string;
}

export async function moveUnit(
  unitId: string,
  payload: MoveUnitPayload,
): Promise<OrganizationUnit> {
  const { data } = await api.post(
    `/api/v1/organization/units/${unitId}/move/`,
    payload,
  );
  return data;
}

export interface DeactivateUnitPayload {
  reason?: string;
}

export async function deactivateUnit(
  unitId: string,
  payload: DeactivateUnitPayload,
): Promise<OrganizationUnit> {
  const { data } = await api.post(
    `/api/v1/organization/units/${unitId}/deactivate/`,
    payload,
  );
  return data;
}

export async function fetchUnitAncestors(
  unitId: string,
): Promise<OrganizationUnit[]> {
  const { data } = await api.get<{ data: OrganizationUnit[] }>(
    `/api/v1/organization/units/${unitId}/ancestors/`,
  );
  return data.data;
}

export async function fetchUnitDescendants(
  unitId: string,
): Promise<OrganizationUnit[]> {
  const { data } = await api.get<{ data: OrganizationUnit[] }>(
    `/api/v1/organization/units/${unitId}/descendants/`,
  );
  return data.data;
}
