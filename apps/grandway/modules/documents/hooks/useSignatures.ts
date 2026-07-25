"use client";

import { useQuery } from "@peppermint/ui";
import { documentsApi } from "../documents.api";
import { documentSignaturesKey } from "../documents.queryKeys";
import type { Signature } from "../documents.types";

/**
 * Active signatories for the certificate signatory picker, from the `document_templates`
 * library (`GET /api/v1/document-templates/signatories/?status=active`). Grandway's
 * `signature_image` is a plain external URL, so — unlike mintway — there is no auth-gated
 * blob fetch or object-URL lifecycle to manage.
 */
export function useSignatures() {
  return useQuery<Signature[]>({
    queryKey: documentSignaturesKey(),
    queryFn: () => documentsApi.listActiveSignatories(),
    staleTime: 5 * 60 * 1000,
  });
}
