import type { MantineRadius } from "@peppermint/ui";

export interface ApplicantPhotoProps {
  /** Whose photograph to show. `null` renders the initials fallback without fetching. */
  applicantId: string | null | undefined;
  /** Used for the initials fallback and the image's alt text. */
  name: string;
  /** Avatar edge length in px. Defaults to 36 (a table row's comfortable height). */
  size?: number;
  radius?: MantineRadius;
  /**
   * Skip the fetch entirely — for surfaces that render many at once and want to
   * defer (or opt out of) the per-photo audited download. Defaults to `true`.
   */
  enabled?: boolean;
}
