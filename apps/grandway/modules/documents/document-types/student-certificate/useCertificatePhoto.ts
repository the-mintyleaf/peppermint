"use client";

import { useFileBlob } from "@/modules/admin/uploaded-files/_shared/useFileBlob";
import type { StudentFullData } from "../../documents.types";

/**
 * The portrait a certificate prints, as a URL for `<img>` (or `""` for the grey
 * placeholder box).
 *
 * A certificate saved since 2026-10-29 names its photograph
 * (`content.photo_media_id`). When that is the applicant's current photograph —
 * the usual case — the editor's already-resolved URL is reused, and the byte
 * query is shared, so nothing extra is downloaded. A certificate pinned to an
 * older photograph (or opened before the current-photo lookup settles) fetches
 * its own bytes (an audited read, cached for good). An older certificate names none and
 * keeps its previous behaviour: a stored `image` URL, else the current photograph.
 */
export function useCertificatePhoto(
  photoMediaId: string | null,
  imageOverride: string | undefined,
  student: StudentFullData | null | undefined,
): string {
  const currentId = student?.photoFileId;
  const currentUrl = student?.photoUrl ?? "";
  const fallback = imageOverride || currentUrl;

  // Always resolve the stored id itself. When it is the current photograph this
  // is the very query the editor's photograph lookup already runs (`useFileBlob`
  // keys bytes by file id), so it costs nothing extra; when the current-photo
  // lookup is still loading or has failed, the certificate still prints its own.
  const own = useFileBlob(photoMediaId);

  if (!photoMediaId) return fallback;
  if (photoMediaId === currentId && currentUrl) return currentUrl;
  if (own.url) return own.url;
  // An archived or unreadable photograph prints the fallback, not a hole.
  return own.isError ? fallback : "";
}
