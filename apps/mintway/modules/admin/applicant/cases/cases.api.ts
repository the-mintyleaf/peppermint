import type { QueryParams } from "@peppermint/admin";

import api from "@/lib/api";
import type {
  ApplicationCase,
  ApplicationCaseStatusHistoryEntry,
  CaseStatus,
} from "../_shared";

// ── Nested under an applicant ────────────────────────────────────────────────

/** `GET /api/v1/applicants/:id/cases/` — the applicant's cases, paginated. */
export async function fetchCases(
  applicantId: string,
  params?: QueryParams,
): Promise<{
  data: ApplicationCase[];
  meta: { total: number } & Record<string, unknown>;
}> {
  const { data } = await api.get(`/api/v1/applicants/${applicantId}/cases/`, {
    params: {
      page: params?.page,
      page_size: params?.pageSize,
      ...params?.filters,
    },
  });
  return {
    data: data.data,
    meta: { ...data.meta, total: data.meta?.count ?? 0 },
  };
}

export interface CaseCreatePayload extends Record<string, unknown> {
  destination_country?: string;
}

/** `POST /api/v1/applicants/:id/cases/` — opens a case (status `planning`). */
export async function createCase(
  applicantId: string,
  body: CaseCreatePayload,
): Promise<ApplicationCase> {
  const { data } = await api.post<ApplicationCase>(
    `/api/v1/applicants/${applicantId}/cases/`,
    body,
  );
  return data;
}

// ── Top-level case resource ──────────────────────────────────────────────────

/** `GET /api/v1/application-cases/:caseId/`. */
export async function getCase(caseId: string): Promise<ApplicationCase> {
  const { data } = await api.get<ApplicationCase>(
    `/api/v1/application-cases/${caseId}/`,
  );
  return data;
}

export interface CaseUpdatePayload extends Record<string, unknown> {
  record_version: number;
}

/** `PATCH /api/v1/application-cases/:caseId/` — non-status fields + record_version. */
export async function updateCase(
  caseId: string,
  body: CaseUpdatePayload,
): Promise<ApplicationCase> {
  const { data } = await api.patch<ApplicationCase>(
    `/api/v1/application-cases/${caseId}/`,
    body,
  );
  return data;
}

export interface CaseTransitionPayload {
  into_status: CaseStatus;
  reason?: string;
  notes?: string;
  record_version: number;
}

/** `POST /api/v1/application-cases/:caseId/transition/`. */
export async function transitionCase(
  caseId: string,
  body: CaseTransitionPayload,
): Promise<ApplicationCase> {
  const { data } = await api.post<ApplicationCase>(
    `/api/v1/application-cases/${caseId}/transition/`,
    body,
  );
  return data;
}

/** `GET /api/v1/application-cases/:caseId/status-history/` — newest first. */
export async function fetchCaseStatusHistory(
  caseId: string,
  params?: QueryParams,
): Promise<{
  data: ApplicationCaseStatusHistoryEntry[];
  meta: { total: number };
}> {
  const { data } = await api.get(
    `/api/v1/application-cases/${caseId}/status-history/`,
    { params: { page: params?.page, page_size: params?.pageSize } },
  );
  return { data: data.data, meta: { total: data.meta?.count ?? 0 } };
}
