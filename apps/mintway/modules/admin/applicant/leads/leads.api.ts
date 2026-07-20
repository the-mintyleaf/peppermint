import { createResourceApi } from "@peppermint/admin";
import type { QueryParams } from "@peppermint/admin";

import api from "@/lib/api";
import type { Applicant, DuplicateMeta } from "../_shared";
import type {
  Lead,
  LeadConvertPayload,
  LeadCreatePayload,
  LeadUpdatePayload,
} from "./leads.types";

/**
 * Newest enquiry first — the working set is "who came in recently and still
 * needs handling". `created_at` is server-set and non-null, so unlike a
 * user-entered date it always sorts deterministically.
 */
const DEFAULT_ORDERING = "-created_at";

interface LeadListResponse {
  data: Lead[];
  meta: { total: number } & Record<string, unknown>;
}

const resource = createResourceApi<Lead, LeadCreatePayload, LeadUpdatePayload>({
  client: api,
  basePath: "/api/v1/applicants/leads",
});

/**
 * `GET /api/v1/applicants/leads/` — the enquiry funnel.
 *
 * Filters: `lead_source`, `payment_status`, `education_level`, `converted`.
 * Ordering ∈ {full_name, created_at, updated_at, lead_code}.
 *
 * An explicit `ordering` is always sent. The server's default is unstated
 * (gaps.md #9), and an unstable one across page requests would let the same lead
 * appear on two pages while another is never shown. `createResourceApi` only
 * emits `ordering` when the user has picked a sort, so the default is applied
 * here rather than relying on that.
 */
export function fetchLeads(params?: QueryParams) {
  if (!params) return resource.list() as Promise<LeadListResponse>;

  // `defaultToServerParams` spreads `filters` first and only appends its own
  // `ordering` when a sort is set, so a filters-borne default survives when the
  // user hasn't picked one and is correctly overridden the moment they do.
  const hasUserSort = params.sort.length > 0;
  return resource.list(
    hasUserSort
      ? params
      : {
          ...params,
          filters: { ordering: DEFAULT_ORDERING, ...params.filters },
        },
  ) as Promise<LeadListResponse>;
}

/** `GET /api/v1/applicants/leads/{id}/`. */
export function getLead(id: string): Promise<Lead> {
  return resource.get(id);
}

/** `POST /api/v1/applicants/leads/` — staff and above. */
export function createLead(body: LeadCreatePayload): Promise<Lead> {
  return resource.create(body);
}

/** `PATCH /api/v1/applicants/leads/{id}/` — 409 if the lead is already converted. */
export function updateLead(id: string, body: LeadUpdatePayload): Promise<Lead> {
  return resource.update(id, body);
}

// ── Convert ───────────────────────────────────────────────────────────────────

export interface LeadConvertResult {
  lead: Lead;
  applicant: Applicant;
}

/**
 * The api-client interceptor unwraps `{ success, data, meta }` to `data` and drops
 * `meta`, but convert returns a non-blocking `meta.possible_duplicate` +
 * masked `matches[]` that the UI must surface. Re-tagging a **success** payload
 * makes the interceptor's `isEnvelope` check fail so it leaves the body intact;
 * **error** envelopes pass through untouched so `getApiError` still finds `.error`.
 *
 * Mirrors `postCapturingMeta` in `_shared/applicant.api.ts` — kept local rather
 * than shared because the two return different payload shapes.
 */
interface CapturedEnvelope<T> {
  payload: T;
  meta: Record<string, unknown>;
}

function captureMetaTransform(raw: string): unknown {
  // A non-JSON body (e.g. a 502 HTML gateway page) must not throw here — that
  // would surface as a SyntaxError with no `.response`, losing the HTTP status.
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

/**
 * `POST /api/v1/applicants/leads/{id}/convert/` — **admin/superadmin only**.
 *
 * Creates an `interested` applicant plus an address, identity document and
 * interest profile, then **freezes** the lead. Irreversible.
 */
export async function convertLead(
  id: string,
  body: LeadConvertPayload,
): Promise<{ data: LeadConvertResult; meta: DuplicateMeta }> {
  const res = await api.post<CapturedEnvelope<LeadConvertResult>>(
    `/api/v1/applicants/leads/${id}/convert/`,
    body,
    { transformResponse: [captureMetaTransform] },
  );
  return {
    data: res.data.payload,
    meta: (res.data.meta ?? {}) as DuplicateMeta,
  };
}
