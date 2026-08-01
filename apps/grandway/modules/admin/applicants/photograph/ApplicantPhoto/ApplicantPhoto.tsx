"use client";

import { Avatar, Skeleton } from "@peppermint/ui";
import { useApplicantPhotograph } from "../applicantPhotograph.hooks";
import { applicantInitials } from "../applicantPhotograph.utils";
import type { ApplicantPhotoProps } from "./ApplicantPhoto.types";

/**
 * The applicant's photograph as an avatar, with initials as the fallback.
 *
 * "No photograph on file" and "the fetch failed" both land on the same initials
 * fallback deliberately: neither is actionable from a row or a header, and an
 * error glyph on a face-shaped element reads as a broken page rather than a
 * missing upload. The place that *can* act on it — the edit form — surfaces
 * both states explicitly (`ApplicantPhotoField`).
 *
 * Costs two requests per distinct applicant (the file lookup and the audited
 * byte download), both cached indefinitely. On a list, that is one pair per row
 * — see the module's `docs/AI.md` for why that is accepted here and what the
 * `enabled` escape hatch is for.
 */
export function ApplicantPhoto({
  applicantId,
  name,
  size = 36,
  radius = "xl",
  enabled = true,
}: ApplicantPhotoProps) {
  const { url, isLoading } = useApplicantPhotograph(applicantId, enabled);

  if (isLoading) {
    return <Skeleton height={size} width={size} circle={radius === "xl"} />;
  }

  return (
    <Avatar
      src={url}
      alt={url ? `Photograph of ${name}` : undefined}
      size={size}
      radius={radius}
      color="blue"
    >
      {applicantInitials(name)}
    </Avatar>
  );
}
