import { APPLICANT_SECTIONS, sectionHref } from "../../../_shared";
import type { ApplicantSection, ApplicantSectionId } from "../../../_shared";

/**
 * A short, human descriptor per detail section — the tile subtitle in the profile hub.
 * Keyed by section id so it stays in lock-step with `APPLICANT_SECTIONS` (the single
 * source of order + role-gating). "overview" is the full field record.
 */
const SECTION_DESCRIPTIONS: Record<ApplicantSectionId, string> = {
  overview: "Full profile record",
  addresses: "Locations on file",
  identity: "Documents & media",
  education: "Academic history",
  family: "Family & references",
  interests: "Study preferences",
  crm: "Interactions & compliance",
  cases: "Application cases",
  assignments: "Counsellor assignments",
  history: "Lifecycle & lock log",
};

export interface ProfileSectionTileConfig extends ApplicantSection {
  description: string;
  href: string;
}

/**
 * Ordered section tiles for one applicant, role-filtered (staff reach overview +
 * addresses only) and paired with their destination route. Tiles are launchers — they
 * link out to the existing `/admin/applicants/[id]/[section]` pages.
 */
export function getProfileSectionTiles(
  applicantId: string,
  isAdmin: boolean,
): ProfileSectionTileConfig[] {
  return APPLICANT_SECTIONS.filter((s) => isAdmin || !s.adminOnly).map(
    (section) => ({
      ...section,
      description: SECTION_DESCRIPTIONS[section.id],
      href: sectionHref(applicantId, section.id),
    }),
  );
}
