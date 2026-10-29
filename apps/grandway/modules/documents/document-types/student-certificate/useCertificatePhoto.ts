"use client";

import { useFileBlob } from "@/modules/admin/uploaded-files/_shared/useFileBlob";
import type { StudentFullData } from "../../documents.types";

/**
 * The portrait a certificate prints, as a URL for `<img>` (or `""` for the grey
 * placeholder box).
 *
 * A certificate saved since 2026-10-29 names its photograph
 * (`content.photo_media_id`). When that is the applicant's current photograph —
 * the usual case — the editor's already-resolved URL is reused, so nothing extra
 * is downloaded. Only a certificate pinned to an older photograph fetches its own
 * bytes (an audited read, cached for good). An older certificate names none and
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

  // Until the editor knows the current photograph, it cannot tell whether the
  // stored one differs — wait rather than download a photo it may already hold.
  const pinnedElsewhere =
    !!photoMediaId && currentId !== undefined && photoMediaId !== currentId;
  const own = useFileBlob(pinnedElsewhere ? photoMediaId : null);

  if (!photoMediaId) return fallback;
  if (photoMediaId === currentId) return currentUrl;
  if (own.url) return own.url;
  // An archived or unreadable photograph prints the fallback, not a hole.
  return own.isError ? fallback : "";
}
