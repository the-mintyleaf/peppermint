"use client";

import { useQuery } from "@peppermint/ui";
import { documentsApi } from "../documents.api";
import { documentPrefillKey } from "../documents.queryKeys";
import type { DocumentPrefill } from "../documentPrefill.types";

export interface UseDocumentPrefillOptions {
  /** Defaults to `true`. Pass `false` when the form is editing, not creating. */
  enabled?: boolean;
}

/**
 * The applicant's file shaped for document forms
 * (`GET /documents/prefill/<applicant_id>/`, Admin only).
 *
 * Read **when a form opens** (no cache; every mount refetches — seed only once
 * `isFetchedAfterMount` is true, so the values are this open's), never on
 * a keystroke, and never pushed into a document that already exists: it seeds a
 * NEW document's editable fields and nothing else. A form must not be blocked by
 * it either — on error, open the form empty and let the operator type.
 *
 * Disabled with no applicant (a standalone document has none to read).
 */
export function useDocumentPrefill(
  applicantId: string | null | undefined,
  { enabled = true }: UseDocumentPrefillOptions = {},
) {
  return useQuery<DocumentPrefill>({
    queryKey: documentPrefillKey(applicantId ?? "none"),
    queryFn: () => documentsApi.getPrefill(applicantId as string),
    enabled: enabled && Boolean(applicantId),
    // Never seed from a cached copy: an applicant edited a minute ago must not
    // open a new document with the old values. No cache kept, and every mount
    // fetches — callers wait for `isFetchedAfterMount` before seeding.
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    // A refused or unknown applicant will not start succeeding on retry.
    retry: false,
  });
}
