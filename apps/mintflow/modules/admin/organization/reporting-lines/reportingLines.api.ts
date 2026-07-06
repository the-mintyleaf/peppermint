import type { QueryParams } from "@peppermint/admin";

import api from "@/lib/api";

import type { OrganizationListResponse } from "../_shared/organization.types";
import type { ReportingLine, ReportingLineType } from "./reportingLines.types";

export async function fetchReportingLines(
  organizationId: string,
  params?: QueryParams,
): Promise<OrganizationListResponse<ReportingLine>> {
  const { data } = await api.get(
    `/api/v1/organization/organizations/${organizationId}/reporting-lines/`,
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

export interface CreateReportingLinePayload {
  source_position_id: string;
  target_position_id: string;
  reporting_line_type: ReportingLineType;
  status?: ReportingLine["status"];
  is_primary?: boolean;
  reason?: string;
}

export async function createReportingLine(
  organizationId: string,
  values: CreateReportingLinePayload,
): Promise<ReportingLine> {
  const { data } = await api.post(
    `/api/v1/organization/organizations/${organizationId}/reporting-lines/`,
    values,
  );
  return data;
}

export async function endReportingLine(
  reportingLineId: string,
  payload: { reason?: string },
): Promise<ReportingLine> {
  const { data } = await api.post(
    `/api/v1/organization/reporting-lines/${reportingLineId}/end/`,
    payload,
  );
  return data;
}

export interface ChainOfCommandLink {
  position_id: string;
  code: string;
  title_np: string;
  title_en?: string;
  depth: number;
}

export async function fetchChainOfCommand(
  positionId: string,
  reportingLineType = "administrative",
): Promise<ChainOfCommandLink[]> {
  const { data } = await api.get<{ data: ChainOfCommandLink[] }>(
    `/api/v1/organization/positions/${positionId}/chain-of-command/`,
    { params: { reporting_line_type: reportingLineType } },
  );
  return data.data;
}

export interface SubordinatePosition {
  id: string;
  code: string;
  title_np: string;
  title_en?: string;
}

export async function fetchSubordinates(
  positionId: string,
): Promise<SubordinatePosition[]> {
  const { data } = await api.get<{ data: SubordinatePosition[] }>(
    `/api/v1/organization/positions/${positionId}/subordinates/`,
  );
  return data.data;
}
