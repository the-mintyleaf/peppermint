"use client";

import { useQuery } from "@peppermint/ui";
import { useAppMutation } from "@peppermint/admin";
import { archiveFile, fileQueryKeys } from "@/modules/admin/uploaded-files";
import type { UploadedFile } from "@/modules/admin/uploaded-files";
import {
  changeSignatoryStatus,
  createSignatory,
  fetchSignatories,
  getSignatory,
  updateSignatory,
  uploadSignatorySignature,
} from "./signatures.api";
import {
  activeSignatoriesKey,
  signatoriesListKey,
  signatoryQueryKeys,
} from "./signatures.queryKeys";
import type {
  Signatory,
  SignatoryCreatePayload,
  SignatoryListFilters,
  SignatoryStatusPayload,
  SignatoryUpdatePayload,
} from "./signatures.types";

/**
 * The management screen's list. Omits `status` by default, so draft and retired
 * signers are visible — a library that showed only active rows would hide the
 * `draft` a user just created and look broken (§7).
 */
export function useSignatoryList(
  filters: SignatoryListFilters = {},
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: signatoriesListKey(filters),
    queryFn: () => fetchSignatories(filters),
    // Every route here is Admin-only, reads included, so a caller outside that
    // tier must be able to not-ask rather than collect a 403.
    enabled: options.enabled ?? true,
  });
}

/**
 * The picker feed — active signatories only, since a `draft` is deliberately
 * not offered and a retired one must stop being offered (§5).
 *
 * Held for five minutes because every certificate mount reads it and the
 * library changes about as often as staff do. The mutations below invalidate
 * the whole tree, so an activation still lands immediately.
 */
export function useActiveSignatories() {
  return useQuery({
    queryKey: activeSignatoriesKey(),
    queryFn: () => fetchSignatories({ status: "active" }),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * One signatory by id, for the edit screen.
 *
 * A detail read rather than a lookup in whichever list happens to be mounted:
 * the library list is filterable, so a row being edited may not be in it — and
 * once its status changes it *stops* being in it, which would turn a successful
 * save into "signatory not found". A retired signatory stays retrievable by id
 * forever (§7), so this is the one read that always answers.
 */
export function useSignatoryDetail(id: string | null) {
  return useQuery({
    queryKey: id
      ? signatoryQueryKeys.detail(id)
      : ["signatures.signatories", "detail", "none"],
    queryFn: () => getSignatory(id as string),
    enabled: id !== null,
  });
}

/**
 * Every mutation invalidates the whole `signatures.signatories` tree rather
 * than one key. A single write moves a row between the management list and the
 * picker feed at once (activating a draft adds it to `?status=active`;
 * retiring removes it), and both may be mounted — the manage modal is opened
 * from the editor that is rendering the picker. There is no cheap way to know
 * which is live, and the library is small enough that a broad invalidate costs
 * one request.
 *
 * **Deliberately not invalidated: the signature *bytes*.** Those are keyed
 * outside this tree by `useFileBlob`, because bytes are immutable for a given
 * file id — a replacement is a new id and lands on a new key. Widening this to
 * match them would re-download every mounted signature on any unrelated write,
 * and each download writes an audit event.
 */
function invalidateAllSignatories() {
  return [signatoryQueryKeys.all];
}

/** `POST /signatories/` — 201, always lands `draft`. Activation is a separate call. */
export function useCreateSignatory() {
  return useAppMutation<Signatory, SignatoryCreatePayload>({
    mutationFn: (body) => createSignatory(body),
    successMessage: "Signatory created as a draft.",
    errorTitle: "Couldn't create signatory",
    invalidateKeys: invalidateAllSignatories(),
  });
}

/** `PATCH /signatories/<id>/` — name/title/role/url only; anything else is rejected by name. */
export function useUpdateSignatory(id: string) {
  return useAppMutation<Signatory, SignatoryUpdatePayload>({
    mutationFn: (body) => updateSignatory(id, body),
    successMessage: "Signatory updated.",
    errorTitle: "Couldn't update signatory",
    invalidateKeys: invalidateAllSignatories(),
  });
}

/**
 * `POST /signatories/<id>/signature/` — 201, multipart, returns the updated
 * `Signatory`. `formData` is built by the upload form, which is the only place
 * that holds the `File`.
 */
export function useUploadSignatorySignature(id: string) {
  return useAppMutation<Signatory, FormData>({
    mutationFn: (formData) => uploadSignatorySignature(id, formData),
    successMessage: "Signature image uploaded.",
    errorTitle: "Couldn't upload signature image",
    invalidateKeys: invalidateAllSignatories(),
  });
}

/**
 * The same upload, but with the signatory id supplied **per call** rather than
 * bound at mount — the create flow only learns the id when the create resolves,
 * so it cannot bind one in advance.
 */
export function useUploadSignatureToSignatory() {
  return useAppMutation<Signatory, { id: string; formData: FormData }>({
    mutationFn: ({ id, formData }) => uploadSignatorySignature(id, formData),
    successMessage: "Signature image uploaded.",
    errorTitle: "Couldn't upload signature image",
    invalidateKeys: invalidateAllSignatories(),
  });
}

/**
 * Removing a signature is **archiving its file**, cross-app on the `uploaded_files`
 * module — this API has no removal endpoint and no delete service, and the
 * backend pins four plausible names in a no-delete test so nobody adds one.
 * After it lands, `signature_file` returns to `null` and `signature_source`
 * falls back to `"url"` or `"none"`.
 *
 * It cannot reuse `uploaded-files`' own `useArchiveFile`, which invalidates only
 * the files tree: the row that visibly changes is the **signatory**, and without
 * this invalidation the panel would keep rendering a signature the operator had
 * just withdrawn. Both trees are invalidated, since the file's own record
 * changed too.
 *
 * A `reason` is required non-blank by that endpoint.
 */
export function useRemoveSignatorySignature(fileId: string) {
  return useAppMutation<UploadedFile, { reason: string }>({
    mutationFn: (body) => archiveFile(fileId, body),
    successMessage: "Signature image removed.",
    errorTitle: "Couldn't remove signature image",
    invalidateKeys: [...invalidateAllSignatories(), fileQueryKeys.all],
  });
}

/**
 * `POST /signatories/<id>/status/` — the activate / retire button. Any
 * transition in any order, including `inactive` → `active` (§5).
 */
export function useChangeSignatoryStatus(id: string) {
  return useAppMutation<Signatory, SignatoryStatusPayload>({
    mutationFn: (body) => changeSignatoryStatus(id, body),
    successMessage: "Signatory status updated.",
    errorTitle: "Couldn't change signatory status",
    invalidateKeys: invalidateAllSignatories(),
  });
}
