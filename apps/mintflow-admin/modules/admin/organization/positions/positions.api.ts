import type { QueryParams } from "@peppermint/admin";

import api from "@/lib/api";

import type {
  OrganizationListResponse,
  PositionAssignment,
} from "../_shared/organization.types";
import type { Position, PositionType } from "./positions.types";

export async function fetchPositions(
  unitId: string,
  params?: QueryParams,
): Promise<OrganizationListResponse<Position>> {
  const { data } = await api.get(
    `/api/v1/organization/units/${unitId}/positions/`,
    {
      params: {
        page: params?.page,
        page_size: params?.pageSize,
        search: params?.search || undefined,
        ...params?.filters,
      },
    },
  );
  return { data: data.data, meta: { ...data.meta, total: data.meta.count } };
}

export interface CreatePositionPayload {
  title_np: string;
  title_en?: string;
  sort_order: number;
  code: string;
  position_type: PositionType;
  is_leadership?: boolean;
  is_supervisory?: boolean;
  is_single_occupant?: boolean;
  max_occupants?: number;
  description?: string;
}

export async function createPosition(
  unitId: string,
  values: CreatePositionPayload,
): Promise<Position> {
  const { data } = await api.post(
    `/api/v1/organization/units/${unitId}/positions/`,
    values,
  );
  return data;
}

export async function fetchPosition(id: string): Promise<Position> {
  const { data } = await api.get(`/api/v1/organization/positions/${id}/`);
  return data;
}

export interface UpdatePositionPayload {
  title_np?: string;
  title_en?: string;
  sort_order?: number;
  code?: string;
  position_type?: PositionType;
  status?: Position["status"];
  description?: string;
  is_leadership?: boolean;
  is_supervisory?: boolean;
  is_single_occupant?: boolean;
  max_occupants?: number;
}

export async function updatePosition(
  id: string,
  values: UpdatePositionPayload,
): Promise<Position> {
  const { data } = await api.patch(
    `/api/v1/organization/positions/${id}/`,
    values,
  );
  return data;
}

export interface DeactivatePositionPayload {
  reason?: string;
}

export async function deactivatePosition(
  id: string,
  payload: DeactivatePositionPayload,
): Promise<Position> {
  const { data } = await api.post(
    `/api/v1/organization/positions/${id}/deactivate/`,
    payload,
  );
  return data;
}

export async function fetchPositionHolders(
  id: string,
): Promise<PositionAssignment[]> {
  const { data } = await api.get<{ data: PositionAssignment[] }>(
    `/api/v1/organization/positions/${id}/holders/`,
  );
  return data.data;
}
