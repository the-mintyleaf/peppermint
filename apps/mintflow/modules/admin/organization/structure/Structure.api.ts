import api from "@/lib/api";

import type {
  OrganizationUnit,
  UnitMutationResult,
} from "../_shared/organization.types";
// Payload types now live with the data-source seam; re-exported here for the
// existing importers (Structure.hooks.ts and the unit modals).
import type {
  CreateUnitPayload,
  DeactivateUnitPayload,
  MoveUnitPayload,
  UpdateUnitPayload,
} from "../_shared/structure-data";

export type {
  CreateUnitPayload,
  DeactivateUnitPayload,
  MoveUnitPayload,
  UpdateUnitPayload,
};

export async function fetchUnitDetail(
  unitId: string,
): Promise<OrganizationUnit> {
  const { data } = await api.get(`/api/v1/organization/units/${unitId}/`);
  return data;
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
