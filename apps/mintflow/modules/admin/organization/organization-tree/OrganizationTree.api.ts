import api from "@/lib/api";

export interface CreateUnitInput {
  organization: string;
  name: string;
  code?: string;
  unitType?: string;
  parentUnit?: string | null;
}

export interface CreatePositionInput {
  organization: string;
  unit: string;
  title: string;
  code?: string;
  positionType?: string;
}

export async function fetchUnitTree(
  orgId: string,
): Promise<{ units: unknown[]; positions: unknown[] }> {
  const res = await api.get(
    `/api/v1/organization/organizations/${orgId}/unit-tree/`,
  );
  const d = res.data;
  // API returns: data is a nested array of unit objects
  const units = Array.isArray(d) ? d : (d.units ?? d.results ?? d ?? []);
  return { units, positions: [] };
}

export interface UpdateUnitInput {
  id: string;
  name?: string;
  unitType?: string;
  description?: string;
  status?: string;
}

export async function updateUnit(data: UpdateUnitInput): Promise<{ id: string }> {
  const res = await api.patch(`/api/v1/organization/units/${data.id}/`, {
    name: data.name,
    unit_type: data.unitType,
    description: data.description,
    status: data.status,
  });
  return { id: res.data.id };
}

export async function createUnit(
  data: CreateUnitInput,
): Promise<{ id: string }> {
  const res = await api.post(
    `/api/v1/organization/organizations/${data.organization}/units/`,
    {
      name: data.name,
      code: data.code,
      unit_type: data.unitType,
      parent: data.parentUnit ?? null,
    },
  );
  return { id: res.data.id };
}

export async function createPosition(
  data: CreatePositionInput,
): Promise<{ id: string }> {
  const res = await api.post(
    `/api/v1/organization/units/${data.unit}/positions/`,
    {
      title: data.title,
      code: data.code,
      position_type: data.positionType,
    },
  );
  return { id: res.data.id };
}
