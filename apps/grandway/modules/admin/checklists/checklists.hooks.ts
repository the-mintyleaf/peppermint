"use client";

import { useQuery } from "@peppermint/ui";
import { useAppMutation } from "@peppermint/admin";
import type { QueryParams } from "@peppermint/admin";
import {
  activateChecklist,
  archiveChecklist,
  completeChecklist,
  createChecklist,
  createChecklistItem,
  createTemplate,
  createTemplateItem,
  fetchJourneysAwaitingChecklist,
  getChecklist,
  getTemplate,
  listChecklists,
  listTemplates,
  reopenChecklist,
  restoreChecklist,
  updateChecklist,
  updateChecklistItem,
  updateItemStatus,
  updateTemplate,
  updateTemplateItem,
} from "./checklists.api";
import {
  awaitingChecklistKey,
  checklistQueryKeys,
  templateQueryKeys,
} from "./checklists.queryKeys";
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
  ReopenChecklistPayload,
  UpdateChecklistPayload,
  UpdateItemPayload,
  UpdateTemplateItemPayload,
  UpdateTemplatePayload,
} from "./checklists.types";

// ── Templates ─────────────────────────────────────────────────────────────────

/** Picker/reference source (e.g. the "start over" template re-apply, a template select). */
export function useTemplatesList(params?: QueryParams) {
  return useQuery({
    queryKey: templateQueryKeys.list(params),
    queryFn: () => listTemplates(params),
  });
}

/** Full detail for the Template Detail route — always the real fetch, never the trimmed list row (templates have none). */
export function useTemplateDetail(templateId: string | null) {
  return useQuery({
    queryKey: templateId
      ? templateQueryKeys.detail(templateId)
      : ["checklists.templates", "detail", "none"],
    queryFn: () => getTemplate(templateId as string),
    enabled: templateId !== null,
  });
}

function invalidateTemplateKeysFor(templateId: string) {
  return [templateQueryKeys.lists(), templateQueryKeys.detail(templateId)];
}

/** `POST /templates/` — Admin only. */
export function useCreateTemplate() {
  return useAppMutation<ChecklistTemplate, CreateTemplatePayload>({
    mutationFn: (body) => createTemplate(body),
    successMessage: "Template created.",
    errorTitle: "Couldn't create template",
    invalidateKeys: [templateQueryKeys.lists()],
  });
}

/** `PATCH /templates/<id>/` — Admin only. Also how a template is published (`status: "active"`) or retired. */
export function useUpdateTemplate(templateId: string) {
  return useAppMutation<ChecklistTemplate, UpdateTemplatePayload>({
    mutationFn: (body) => updateTemplate(templateId, body),
    successMessage: "Template updated.",
    errorTitle: "Couldn't update template",
    invalidateKeys: invalidateTemplateKeysFor(templateId),
  });
}

/** `POST /templates/<id>/items/` — Admin only. */
export function useCreateTemplateItem(templateId: string) {
  return useAppMutation<ChecklistTemplateItem, CreateTemplateItemPayload>({
    mutationFn: (body) => createTemplateItem(templateId, body),
    successMessage: "Requirement added.",
    errorTitle: "Couldn't add requirement",
    invalidateKeys: invalidateTemplateKeysFor(templateId),
  });
}

/** `PATCH /templates/<id>/items/<item_id>/` — Admin only. No delete — retire with `is_active: false`. */
export function useUpdateTemplateItem(templateId: string) {
  return useAppMutation<
    ChecklistTemplateItem,
    { itemId: string; body: UpdateTemplateItemPayload }
  >({
    mutationFn: ({ itemId, body }) =>
      updateTemplateItem(templateId, itemId, body),
    successMessage: "Requirement updated.",
    errorTitle: "Couldn't update requirement",
    invalidateKeys: invalidateTemplateKeysFor(templateId),
  });
}

// ── Checklists ────────────────────────────────────────────────────────────────

/** The worklist's own fetch — used directly by `ModalTableShell`'s `queryGetFn`; exposed as a hook for reuse elsewhere. */
export function useChecklistsList(params?: QueryParams) {
  return useQuery({
    queryKey: checklistQueryKeys.list(params),
    queryFn: () => listChecklists(params),
  });
}

/** Full detail for the Checklist Detail route — the only shape carrying `items`; always the real fetch. */
export function useChecklistDetail(checklistId: string | null) {
  return useQuery({
    queryKey: checklistId
      ? checklistQueryKeys.detail(checklistId)
      : ["checklists.checklists", "detail", "none"],
    queryFn: () => getChecklist(checklistId as string),
    enabled: checklistId !== null,
  });
}

/** The safety-net view — rows are JOURNEYS, not checklists (see `JourneyAwaitingChecklist`). */
export function useJourneysAwaitingChecklist(params?: QueryParams) {
  return useQuery({
    queryKey: params
      ? [...awaitingChecklistKey(), params]
      : awaitingChecklistKey(),
    queryFn: () => fetchJourneysAwaitingChecklist(params),
  });
}

function invalidateChecklistKeysFor(checklistId: string) {
  return [checklistQueryKeys.lists(), checklistQueryKeys.detail(checklistId)];
}

/** `POST /` — the manual override; the normal path is auto-inheritance (calls no endpoint). */
export function useCreateChecklist() {
  return useAppMutation<ChecklistDetail, CreateChecklistPayload>({
    mutationFn: (body) => createChecklist(body),
    successMessage: "Checklist created.",
    errorTitle: "Couldn't create checklist",
    invalidateKeys: [checklistQueryKeys.lists()],
  });
}

/** `PATCH /<id>/` — title/description/assigned_to/due_at/notes only; `status` is never sent here. */
export function useUpdateChecklist(checklistId: string) {
  return useAppMutation<ChecklistDetail, UpdateChecklistPayload>({
    mutationFn: (body) => updateChecklist(checklistId, body),
    successMessage: "Checklist updated.",
    errorTitle: "Couldn't update checklist",
    invalidateKeys: invalidateChecklistKeysFor(checklistId),
  });
}

/** `POST /<id>/activate/` — `draft` → `active`; only ever a blank checklist. */
export function useActivateChecklist(checklistId: string) {
  return useAppMutation<ChecklistDetail, void>({
    mutationFn: () => activateChecklist(checklistId),
    successMessage: "Checklist activated.",
    errorTitle: "Couldn't activate checklist",
    invalidateKeys: invalidateChecklistKeysFor(checklistId),
  });
}

/** `POST /<id>/complete/` — requires `progress.required_resolved === progress.required_total`; disable the button proactively rather than relying on this to fail. */
export function useCompleteChecklist(checklistId: string) {
  return useAppMutation<ChecklistDetail, void>({
    mutationFn: () => completeChecklist(checklistId),
    successMessage: "Checklist completed.",
    errorTitle: "Couldn't complete checklist",
    invalidateKeys: invalidateChecklistKeysFor(checklistId),
  });
}

/** `POST /<id>/reopen/` — `completed` → `active`; clears the completion stamp. `reason` optional. */
export function useReopenChecklist(checklistId: string) {
  return useAppMutation<ChecklistDetail, ReopenChecklistPayload>({
    mutationFn: (body) => reopenChecklist(checklistId, body),
    successMessage: "Checklist reopened.",
    errorTitle: "Couldn't reopen checklist",
    invalidateKeys: invalidateChecklistKeysFor(checklistId),
  });
}

/** `POST /<id>/archive/` — `reason` required; frees re-inheritance for a fresh copy of the same template. */
export function useArchiveChecklist(checklistId: string) {
  return useAppMutation<ChecklistDetail, ArchiveChecklistPayload>({
    mutationFn: (body) => archiveChecklist(checklistId, body),
    successMessage: "Checklist archived.",
    errorTitle: "Couldn't archive checklist",
    invalidateKeys: invalidateChecklistKeysFor(checklistId),
  });
}

/** `POST /<id>/restore/` — returns to `status_before_archive`; NOT a reopen. */
export function useRestoreChecklist(checklistId: string) {
  return useAppMutation<ChecklistDetail, void>({
    mutationFn: () => restoreChecklist(checklistId),
    successMessage: "Checklist restored.",
    errorTitle: "Couldn't restore checklist",
    invalidateKeys: invalidateChecklistKeysFor(checklistId),
  });
}

/** `POST /<id>/items/` — a one-off requirement for this applicant; never travels back to the template. */
export function useCreateChecklistItem(checklistId: string) {
  return useAppMutation<ChecklistItem, CreateItemPayload>({
    mutationFn: (body) => createChecklistItem(checklistId, body),
    successMessage: "Item added.",
    errorTitle: "Couldn't add item",
    invalidateKeys: invalidateChecklistKeysFor(checklistId),
  });
}

/** `PATCH /<id>/items/<item_id>/` — descriptive fields only; `status` is NOT editable here. */
export function useUpdateChecklistItem(checklistId: string) {
  return useAppMutation<
    ChecklistItem,
    { itemId: string; body: UpdateItemPayload }
  >({
    mutationFn: ({ itemId, body }) =>
      updateChecklistItem(checklistId, itemId, body),
    successMessage: "Item updated.",
    errorTitle: "Couldn't update item",
    invalidateKeys: invalidateChecklistKeysFor(checklistId),
  });
}

/**
 * `POST /<id>/items/<item_id>/status/` — the daily act. The response is the
 * ITEM ALONE and carries no `progress`; invalidating the checklist's own
 * detail key (`invalidateChecklistKeysFor`) is the ONLY way progress ever
 * refreshes after this call — not optional, always included.
 */
export function useUpdateItemStatus(checklistId: string) {
  return useAppMutation<
    ChecklistItem,
    { itemId: string; body: ItemStatusPayload }
  >({
    mutationFn: ({ itemId, body }) =>
      updateItemStatus(checklistId, itemId, body),
    successMessage: "Item status updated.",
    errorTitle: "Couldn't update item status",
    invalidateKeys: invalidateChecklistKeysFor(checklistId),
  });
}
