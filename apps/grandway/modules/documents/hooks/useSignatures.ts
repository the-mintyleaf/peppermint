"use client";

import { useMemo } from "react";
import { useActiveSignatories } from "@/modules/admin/signatures";
import type { Signatory } from "@/modules/admin/signatures";
import type { Signature } from "../documents.types";

/**
 * Maps the signatory DTO to the editor's narrower render shape. **No image is
 * resolved here** — uploaded bytes need an authenticated fetch per file, and a
 * picker showing twenty names must not trigger twenty audited downloads. Only
 * the certificate adapter, which knows the two signatories a document actually
 * names, resolves anything.
 */
function toSignature(signatory: Signatory): Signature {
  return {
    id: signatory.id,
    name: signatory.name,
    is_active: signatory.is_active,
    title: signatory.title,
    role: signatory.role,
    signature_source: signatory.signature_source,
    signature_file_id: signatory.signature_file?.id ?? null,
    signature_image_url: signatory.signature_image_url,
  };
}

/**
 * Active signatories for the certificate signatory pickers.
 *
 * A thin adapter over `@/modules/admin/signatures`, which owns this domain —
 * the query, its key, and the contract types all live there, so an activation
 * made in the signature manager invalidates this list too. **`documents` reads
 * from `signatures`, never the reverse**; do not reintroduce a second call to
 * `GET /signatories/` here, which is what this file used to be.
 */
export function useSignatures() {
  const query = useActiveSignatories();
  const rows = query.data?.data;

  const data = useMemo(() => (rows ?? []).map(toSignature), [rows]);

  return { ...query, data };
}
