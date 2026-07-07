import api from "@/lib/api";

import type {
  OrganizationUnit,
  UnitMutationResult,
  UnitType,
} from "../_shared/organization.types";

export async function fetchUnitDetail(
  unitId: string,
): Promise<OrganizationUnit> {
  const { data } = await api.get(`/api/v1/organization/units/${unitId}/`);
  return data;
}

export interface CreateUnitPayload {
  name_np: string;
  name_en?: string;
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
): Promise<UnitMutationResult> {
  const { data } = await api.post(
    `/api/v1/organization/organizations/${organizationId}/units/`,
    payload,
  );
  return data;
}

/** Never send `code` or `parent` through this endpoint — use `moveUnit` for re-parenting. */
export interface UpdateUnitPayload {
  name_np?: string;
  name_en?: string;
  unit_type?: UnitType;
  status?: OrganizationUnit["status"];
  description?: string;
  sort_order?: number;
  is_operational?: boolean;
}

export async function updateUnit(
  unitId: string,
  payload: UpdateUnitPayload,
): Promise<UnitMutationResult> {
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
): Promise<UnitMutationResult> {
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
): Promise<UnitMutationResult> {
  const { data } = await api.post(
    `/api/v1/organization/units/${unitId}/deactivate/`,
    payload,
  );
  return data;
}

export async function fetchUnitAncestors(
  unitId: string,
): Promise<OrganizationUnit[]> {
  // Envelope already unwrapped by the response interceptor (non-paginated,
  // `meta` has no `count`) — return `data`, not `data.data`.
  const { data } = await api.get<OrganizationUnit[]>(
    `/api/v1/organization/units/${unitId}/ancestors/`,
  );
  return data;
}

export async function fetchUnitDescendants(
  unitId: string,
): Promise<OrganizationUnit[]> {
  const { data } = await api.get<OrganizationUnit[]>(
    `/api/v1/organization/units/${unitId}/descendants/`,
  );
  return data;
}
