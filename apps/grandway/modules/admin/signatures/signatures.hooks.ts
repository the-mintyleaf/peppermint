"use client";

import { useQuery } from "@peppermint/ui";
import { useAppMutation } from "@peppermint/admin";
import {
  changeSignatoryStatus,
  createSignatory,
  fetchSignatories,
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
export function useSignatoryList(filters: SignatoryListFilters = {}) {
  return useQuery({
    queryKey: signatoriesListKey(filters),
    queryFn: () => fetchSignatories(filters),
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
