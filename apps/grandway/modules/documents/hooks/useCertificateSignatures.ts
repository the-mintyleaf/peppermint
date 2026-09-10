"use client";

import { useMemo } from "react";
import { useResolvedSignatureImage } from "@/modules/admin/signatures";
import type { RenderSignature, Signature } from "../documents.types";

/**
 * Resolves the two signatories a certificate actually names into something its
 * template can render, and returns **only those two**.
 *
 * Why here rather than in the template: an uploaded signature's bytes come from
 * an authenticated route that 401s a plain `<img src>`, so they have to be
 * fetched and handed over as an object URL. Doing that in the adapter keeps
 * every certificate template a pure presentational component — the template
 * still receives a `signature_image` string and still finds its signer by id,
 * so none of them changed.
 *
 * **The hook count is fixed at two**, deliberately. Resolving the whole picker
 * list would mean a hook per row and an audited download per row; a certificate
 * has exactly two signature slots, so two is the honest number. If a template
 * ever needs a third, add a third named call — do not loop.
 */
export function useCertificateSignatures(
  signatures: Signature[] | undefined,
  instructorId: string | null,
  directorId: string | null,
): RenderSignature[] {
  const rows = signatures ?? [];
  const instructor = rows.find((s) => s.id === instructorId) ?? null;
  const director = rows.find((s) => s.id === directorId) ?? null;

  const instructorImage = useResolvedSignatureImage(instructor);
  const directorImage = useResolvedSignatureImage(director);

  return useMemo(() => {
    const resolved: RenderSignature[] = [];
    if (instructor) {
      resolved.push({
        id: instructor.id,
        name: instructor.name,
        role: instructor.role,
        jp_role: instructor.jp_role,
        signature_image: instructorImage.url,
      });
    }
    // A document may name the same signatory in both slots — a school where the
    // director also teaches is not a mistake. Emitting the row twice would give
    // the template two entries with one id; it looks up by id, so one is enough.
    if (director && director.id !== instructor?.id) {
      resolved.push({
        id: director.id,
        name: director.name,
        role: director.role,
        jp_role: director.jp_role,
        signature_image: directorImage.url,
      });
    }
    return resolved;
  }, [instructor, director, instructorImage.url, directorImage.url]);
}
