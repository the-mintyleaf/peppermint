"use client";

import { useMemo } from "react";
import { useCapabilities } from "@/config/access";
import type { Capabilities } from "@/config/access";

/**
 * The applicant-specific rules the 2026-10-29 contract added, derived in ONE
 * place from `config/access` capabilities — this module never reads
 * `authority_type` itself.
 *
 * `applicantStatusChange` is the Admin-only applicant-record lever, and every
 * rule below that the backend reserves for an Admin (restore, assign anyone,
 * edit/delete anyone's note) coincides with it today. When `config/access`
 * grows dedicated capabilities for these, swap the derivations here and nothing
 * else changes.
 */
export interface ApplicantAuthority {
  /** Admin: assign any eligible person, reassign, or clear. */
  assignAnyone: boolean;
  /** Lead Manager: take an unassigned file for themselves, release their own. */
  assignSelf: boolean;
  /** Admin: un-archive through `POST /restore/` (403 for anyone else). */
  restore: boolean;
  /** Archive ("soft delete") through `POST /status/` — the status lever. */
  archive: boolean;
  /**
   * Admin: edit/delete every note, not only one's own. (Writing notes needs no
   * flag — it is the same reach as reading the applicant.)
   */
  moderateNotes: boolean;
}

export function getApplicantAuthority(caps: Capabilities): ApplicantAuthority {
  const reach = caps.applicants;
  const admin = reach && caps.applicantStatusChange;
  return {
    assignAnyone: admin,
    assignSelf: reach && !admin,
    restore: admin,
    archive: admin,
    moderateNotes: admin,
  };
}

export function useApplicantAuthority(): ApplicantAuthority {
  const caps = useCapabilities();
  return useMemo(() => getApplicantAuthority(caps), [caps]);
}
