import { createResourceApi } from "@peppermint/admin";
import type { QueryParams } from "@peppermint/admin";

import api from "@/lib/api";
import type {
  Applicant,
  ApplicantListRow,
  DuplicateMeta,
  EngagementStatus,
  LifecycleHistoryEntry,
  LifecycleStage,
  LockHistoryEntry,
  MergeRecord,
} from "./applicant.types";

// ── Envelope-meta capture ─────────────────────────────────────────────────────

/**
 * The shared api-client interceptor unwraps the `{ success, data, meta }` envelope to
 * `data` for every non-list response, discarding `meta`. The applicant create + merge
 * responses carry a non-blocking `meta.possible_duplicate` + masked `matches[]` warning
 * (§11.2) that we must surface. This `transformResponse` re-tags a **success** payload
 * so the interceptor's `isEnvelope` check fails and it leaves the body intact; **error**
 * envelopes are passed through untouched so `getApiError` still finds `.error`.
 */
interface CapturedEnvelope<T> {
  payload: T;
  meta: Record<string, unknown>;
}

function captureMetaTransform(raw: string): unknown {
  // A non-JSON body (e.g. a 502/504 HTML gateway page) must not throw here — that
  // would surface as a SyntaxError with no `.response`, losing the real HTTP status
  // for `getApiError`. Fall back to `{}` so the error interceptor keeps the response.
  let parsed: { success?: boolean; data?: unknown; meta?: unknown };
  try {
    parsed = raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
  if (parsed && parsed.success === true) {
    return {
      payload: parsed.data,
      meta: parsed.meta ?? {},
    } as CapturedEnvelope<unknown>;
  }
  return parsed;
}

async function postCapturingMeta<T>(
  url: string,
  body: unknown,
): Promise<{ data: T; meta: DuplicateMeta }> {
  const res = await api.post<CapturedEnvelope<T>>(url, body, {
    transformResponse: [captureMetaTransform],
  });
  return {
    data: res.data.payload,
    meta: (res.data.meta ?? {}) as DuplicateMeta,
  };
}

// ── Payload shapes ────────────────────────────────────────────────────────────

/** Create body — staff and admin field sets differ; both are optional partials here. */
export interface ApplicantCreatePayload extends Record<string, unknown> {
  first_name: string;
}

export interface ApplicantUpdatePayload extends Record<string, unknown> {
  record_version: number;
}

export interface TransitionPayload {
  lifecycle_stage?: LifecycleStage;
  engagement_status?: EngagementStatus;
  reason?: string;
  notes?: string;
  qualification_assessment_id?: string;
  record_version: number;
}

export interface MergePayload {
  surviving_applicant_id: string;
  reason: string;
  field_resolutions?: Record<string, "duplicate">;
}

// ── Core resource (list / get) ────────────────────────────────────────────────

const resource = createResourceApi<Applicant>({
  client: api,
  basePath: "/api/v1/applicants",
});

/** `GET /api/v1/applicants/` — role-projected paginated list. */
export function fetchApplicants(params?: QueryParams) {
  return resource.list(params) as Promise<{
    data: ApplicantListRow[];
    meta: { total: number } & Record<string, unknown>;
  }>;
}

/** `GET /api/v1/applicants/{id}/`. */
export function getApplicant(id: string): Promise<Applicant> {
  return resource.get(id);
}

// ── Mutations ─────────────────────────────────────────────────────────────────

/** `POST /api/v1/applicants/` → applicant + duplicate warning meta (§1.2). */
export function createApplicant(
  body: ApplicantCreatePayload,
): Promise<{ data: Applicant; meta: DuplicateMeta }> {
  return postCapturingMeta<Applicant>("/api/v1/applicants/", body);
}

/** `PATCH /api/v1/applicants/{id}/` — partial write + mandatory `record_version`. */
export async function updateApplicant(
  id: string,
  body: ApplicantUpdatePayload,
): Promise<Applicant> {
  const { data } = await api.patch<Applicant>(
    `/api/v1/applicants/${id}/`,
    body,
  );
  return data;
}

/** `DELETE /api/v1/applicants/{id}/` — soft archive; `record_version` + reason in body. */
export async function archiveApplicant(
  id: string,
  recordVersion: number,
  reason?: string,
): Promise<void> {
  await api.delete(`/api/v1/applicants/${id}/`, {
    data: { record_version: recordVersion, ...(reason ? { reason } : {}) },
  });
}

/** `POST /api/v1/applicants/{id}/transition/` (admin) — funnel / engagement change. */
export async function transitionApplicant(
  id: string,
  body: TransitionPayload,
): Promise<Applicant> {
  const { data } = await api.post<Applicant>(
    `/api/v1/applicants/${id}/transition/`,
    body,
  );
  return data;
}

/** `POST /api/v1/applicants/{id}/lock/` (admin) — reason mandatory. */
export async function lockApplicant(
  id: string,
  reason: string,
): Promise<Applicant> {
  const { data } = await api.post<Applicant>(`/api/v1/applicants/${id}/lock/`, {
    reason,
  });
  return data;
}

/** `POST /api/v1/applicants/{id}/unlock/` (admin) — reason mandatory. */
export async function unlockApplicant(
  id: string,
  reason: string,
): Promise<Applicant> {
  const { data } = await api.post<Applicant>(
    `/api/v1/applicants/${id}/unlock/`,
    { reason },
  );
  return data;
}

/** `POST /api/v1/applicants/{duplicate_id}/merge/` (admin, §14). */
export function mergeApplicant(
  duplicateId: string,
  body: MergePayload,
): Promise<{
  data: { surviving_applicant: Applicant; merge: MergeRecord };
  meta: DuplicateMeta;
}> {
  return postCapturingMeta(`/api/v1/applicants/${duplicateId}/merge/`, body);
}

// ── History feeds (admin, read-only, paginated newest-first) ──────────────────

export async function fetchLifecycleHistory(
  applicantId: string,
  params?: QueryParams,
): Promise<{ data: LifecycleHistoryEntry[]; meta: { total: number } }> {
  const { data } = await api.get(
    `/api/v1/applicants/${applicantId}/lifecycle-history/`,
    { params: { page: params?.page, page_size: params?.pageSize } },
  );
  return { data: data.data, meta: { total: data.meta?.count ?? 0 } };
}

export async function fetchLockHistory(
  applicantId: string,
  params?: QueryParams,
): Promise<{ data: LockHistoryEntry[]; meta: { total: number } }> {
  const { data } = await api.get(
    `/api/v1/applicants/${applicantId}/lock-history/`,
    { params: { page: params?.page, page_size: params?.pageSize } },
  );
  return { data: data.data, meta: { total: data.meta?.count ?? 0 } };
}

export async function fetchMergeHistory(
  applicantId: string,
  params?: QueryParams,
): Promise<{ data: MergeRecord[]; meta: { total: number } }> {
  const { data } = await api.get(
    `/api/v1/applicants/${applicantId}/merge-history/`,
    { params: { page: params?.page, page_size: params?.pageSize } },
  );
  return { data: data.data, meta: { total: data.meta?.count ?? 0 } };
}
