import api from "@/lib/api";
import type { QueryParams } from "@peppermint/admin";
import type { Position, PositionsFetchResponse } from "./positions.types";

export async function fetchPositions(
  orgId: string,
  params?: QueryParams,
): Promise<PositionsFetchResponse> {
  const res = await api.get("/api/v1/organization/positions/", {
    params: {
      organization: orgId,
      page: params?.page ?? 1,
      page_size: params?.pageSize ?? 20,
      search: params?.search,
      status: params?.filters?.status,
    },
  });
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

export async function fetchPosition(id: string): Promise<Position> {
  const res = await api.get(`/api/v1/organization/positions/${id}/`);
  return res.data;
}

export async function createPosition(
  unitId: string,
  values: Partial<Position>,
): Promise<Position> {
  const res = await api.post(`/api/v1/organization/units/${unitId}/positions/`, values);
  return res.data;
}

export async function updatePosition(
  id: string,
  values: Partial<Position>,
): Promise<Position> {
  const res = await api.patch(`/api/v1/organization/positions/${id}/`, values);
  return res.data;
}

export async function deactivatePosition(
  id: string,
  reason?: string,
): Promise<Position> {
  const res = await api.post(
    `/api/v1/organization/positions/${id}/deactivate/`,
    { reason: reason ?? "" },
  );
  return res.data;
}
