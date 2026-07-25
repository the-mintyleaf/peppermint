import { createResourceApi } from "@peppermint/admin";
import type { QueryParams, ResourceListResponse } from "@peppermint/admin";
import api from "@/lib/api";
import type {
  ArchiveChecklistPayload,
  ChecklistDetail,
  ChecklistItem,
  ChecklistTemplate,
  ChecklistTemplateItem,
  CreateChecklistPayload,
  CreateItemPayload,
  CreateTemplateItemPayload,
  CreateTemplatePayload,
  ItemStatusPayload,
  JourneyAwaitingChecklist,
  ReopenChecklistPayload,
  UpdateChecklistPayload,
  UpdateItemPayload,
  UpdateTemplateItemPayload,
  UpdateTemplatePayload,
} from "./checklists.types";

const TEMPLATES = "/api/v1/checklists/templates";
const CHECKLISTS = "/api/v1/checklists";

// ── Templates ─────────────────────────────────────────────────────────────────
//
// `GET /templates/`, `GET /templates/<id>/`, create, and update all share ONE
// retrieve shape (§4) — unlike checklists, templates have no separate trimmed
// list row, so `createResourceApi` is typed directly against `ChecklistTemplate`.

const templateResource = createResourceApi<
  ChecklistTemplate,
  CreateTemplatePayload,
  UpdateTemplatePayload
>({
  client: api,
  basePath: TEMPLATES,
});

export const listTemplates = templateResource.list;
export const getTemplate = templateResource.get;
/** `POST /templates/` — 201, Admin only. */
export const createTemplate = templateResource.create;
/** `PATCH /templates/<id>/` — Admin only. `key` immutable; also how a template is retired (`status: "inactive"`). */
export const updateTemplate = templateResource.update;

/** `POST /templates/<id>/items/` — 201, Admin only. Nested; doesn't fit `createResourceApi`'s single base path. */
export async function createTemplateItem(
  templateId: string,
  body: CreateTemplateItemPayload,
): Promise<ChecklistTemplateItem> {
  const { data } = await api.post<ChecklistTemplateItem>(
    `${TEMPLATES}/${templateId}/items/`,
    body,
  );
  return data;
}

/** `PATCH /templates/<id>/items/<item_id>/` — Admin only. No delete — retire with `is_active: false`. */
export async function updateTemplateItem(
  templateId: string,
  itemId: string,
  body: UpdateTemplateItemPayload,
): Promise<ChecklistTemplateItem> {
  const { data } = await api.patch<ChecklistTemplateItem>(
    `${TEMPLATES}/${templateId}/items/${itemId}/`,
    body,
  );
  return data;
}

// ── Checklists ────────────────────────────────────────────────────────────────
//
// `GET /` rows are really the trimmed `Checklist` list shape, but the resource
// is typed against the richer `ChecklistDetail` (needed by `get`/`create`/
// `update`/`action`); `ChecklistDetail extends Checklist`, so any list-shape
// consumer is still a safe fit (same accepted looseness as `offers.api.ts`).

const checklistResource = createResourceApi<
  ChecklistDetail,
  CreateChecklistPayload,
  UpdateChecklistPayload
>({
  client: api,
  basePath: CHECKLISTS,
});

/** `GET /` — list shape with `progress` on every row. Archived included by default — filter `?status=active`. */
export const listChecklists = checklistResource.list;
/** `GET /<id>/` — the only shape carrying `items`. */
export const getChecklist = checklistResource.get;
/** `POST /` — 201. Manual override; the normal path is auto-inheritance (calls no endpoint, §7). */
export const createChecklist = checklistResource.create;
/** `PATCH /<id>/` — `title`/`description`/`assigned_to`/`due_at`/`notes` only, never `status`. */
export const updateChecklist = checklistResource.update;

/** `POST /<id>/activate/` — `draft` → `active`; only ever a blank checklist. Empty body. */
export function activateChecklist(id: string) {
  return checklistResource.action<ChecklistDetail>(id, "activate", {});
}

/** `POST /<id>/complete/` — `active` → `completed`; requires every required item resolved. Empty body. */
export function completeChecklist(id: string) {
  return checklistResource.action<ChecklistDetail>(id, "complete", {});
}

/** `POST /<id>/reopen/` — `completed` → `active`; clears `completed_at`/`completed_by`. `reason` optional. */
export function reopenChecklist(id: string, body: ReopenChecklistPayload = {}) {
  return checklistResource.action<ChecklistDetail>(id, "reopen", body);
}

/** `POST /<id>/archive/` — any live state → `archived`; `reason` required, frees re-inheritance. */
export function archiveChecklist(id: string, body: ArchiveChecklistPayload) {
  return checklistResource.action<ChecklistDetail>(id, "archive", body);
}

/** `POST /<id>/restore/` — `archived` → `status_before_archive`; NOT a reopen. Empty body. */
export function restoreChecklist(id: string) {
  return checklistResource.action<ChecklistDetail>(id, "restore", {});
}

/** `POST /<id>/items/` — 201. One-off item for this applicant; never travels back to the template. */
export async function createChecklistItem(
  checklistId: string,
  body: CreateItemPayload,
): Promise<ChecklistItem> {
  const { data } = await api.post<ChecklistItem>(
    `${CHECKLISTS}/${checklistId}/items/`,
    body,
  );
  return data;
}

/** `PATCH /<id>/items/<item_id>/` — descriptive fields only; `status` is NOT accepted here. */
export async function updateChecklistItem(
  checklistId: string,
  itemId: string,
  body: UpdateItemPayload,
): Promise<ChecklistItem> {
  const { data } = await api.patch<ChecklistItem>(
    `${CHECKLISTS}/${checklistId}/items/${itemId}/`,
    body,
  );
  return data;
}

/**
 * `POST /<id>/items/<item_id>/status/` — the most-called endpoint in the
 * module. Returns the ITEM ALONE, no `progress` — callers must invalidate the
 * checklist's own detail key to refresh progress (see `checklists.hooks.ts`'s
 * `useUpdateItemStatus`).
 */
export async function updateItemStatus(
  checklistId: string,
  itemId: string,
  body: ItemStatusPayload,
): Promise<ChecklistItem> {
  const { data } = await api.post<ChecklistItem>(
    `${CHECKLISTS}/${checklistId}/items/${itemId}/status/`,
    body,
  );
  return data;
}

// ── Safety net — "journeys awaiting a checklist" ─────────────────────────────
//
// `journey_missing_checklist=true` overrides every other filter and returns a
// DIFFERENT resource (`JourneyAwaitingChecklist`, journeys — not checklists), so
// this is a separate function, never routed through `checklistResource.list`.

/**
 * `GET /?journey_missing_checklist=true` — journeys whose destination country
 * has no checklist yet. `page`/`page_size` still apply; every other filter is
 * ignored by the server once this flag is set, so none are forwarded here.
 */
export async function fetchJourneysAwaitingChecklist(
  params?: QueryParams,
): Promise<ResourceListResponse<JourneyAwaitingChecklist>> {
  const { data } = await api.get<{
    data: JourneyAwaitingChecklist[];
    meta: { count: number } & Record<string, unknown>;
  }>(`${CHECKLISTS}/`, {
    params: {
      journey_missing_checklist: true,
      page: params?.page ?? 1,
      page_size: params?.pageSize ?? 20,
    },
  });
  return { data: data.data, meta: { ...data.meta, total: data.meta.count } };
}
