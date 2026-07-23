import type { Lead, LeadCategory, LeadStage } from "./leadManagement.types";

/**
 * The backend has no scheduled next-follow-up date or reminder field (leads
 * backend is explicitly not a scheduler — `docs/backend/lead-management/CONCEPT.md`
 * "Manual follow-up tracking"). "Needs attention" is therefore a client-computed
 * heuristic over `stage` + `last_followed_up_at`, confirmed with the user:
 * a new/contact-attempted lead untouched for this many hours, or a follow-up-stage
 * lead not touched on the current calendar day.
 */
const ATTENTION_UNTOUCHED_HOURS = 36;
const MS_PER_HOUR = 60 * 60 * 1000;

function hoursSince(isoDate: string, now: Date): number {
  return (now.getTime() - new Date(isoDate).getTime()) / MS_PER_HOUR;
}

function isSameCalendarDay(isoDate: string, now: Date): boolean {
  const d = new Date(isoDate);
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

/**
 * Buckets a lead into exactly one of the 4 dashboard categories — an inbox, not
 * overlapping views, so tab counts sum to the total (confirmed with the user).
 *
 * - `dead` — `lost` (the only reachable terminal non-conversion state today;
 *   `converted` is handled defensively even though it's unreachable in practice).
 * - `needs_attention` — new/contact-attempted leads untouched past the freshness
 *   threshold (measured from the last follow-up, or from creation if never
 *   followed up), or a follow-up-stage lead not touched today.
 * - `upcoming` — counselling/follow-up/ready-for-conversion leads that ARE
 *   progressing (not flagged as needing attention).
 * - `active` — everything else alive and not yet stalled (new/contact-attempted
 *   within the freshness window, or successfully contacted).
 */
export function categorizeLead(
  lead: Lead,
  now: Date = new Date(),
): LeadCategory {
  if (lead.stage === "lost" || lead.stage === "converted") return "dead";

  if (lead.stage === "new" || lead.stage === "contact_attempted") {
    const reference = lead.last_followed_up_at ?? lead.created_at;
    return hoursSince(reference, now) >= ATTENTION_UNTOUCHED_HOURS
      ? "needs_attention"
      : "active";
  }

  if (lead.stage === "follow_up") {
    const touchedToday =
      lead.last_followed_up_at !== null &&
      isSameCalendarDay(lead.last_followed_up_at, now);
    return touchedToday ? "upcoming" : "needs_attention";
  }

  if (lead.stage === "counselling" || lead.stage === "ready_for_conversion") {
    return "upcoming";
  }

  // `contacted` — successful contact happened but no stage progression yet;
  // not stalled long enough by itself to warrant "needs attention".
  return "active";
}

export const CATEGORY_ORDER: LeadCategory[] = [
  "active",
  "needs_attention",
  "upcoming",
  "dead",
];

export const CATEGORY_LABELS: Record<LeadCategory, string> = {
  active: "Active",
  needs_attention: "Needs attention today",
  upcoming: "Upcoming & follow-ups",
  dead: "Dead / closed",
};

export const STAGE_LABELS: Record<LeadStage, string> = {
  new: "New",
  contact_attempted: "Contact Attempted",
  contacted: "Contacted",
  counselling: "Counselling",
  follow_up: "Follow-up",
  ready_for_conversion: "Ready for Conversion",
  converted: "Converted",
  lost: "Lost",
};

export const STAGE_COLORS: Record<LeadStage, string> = {
  new: "blue",
  contact_attempted: "cyan",
  contacted: "teal",
  counselling: "grape",
  follow_up: "yellow",
  ready_for_conversion: "green",
  converted: "green",
  lost: "gray",
};

export function emptyCategoryCounts(): Record<LeadCategory, number> {
  return { active: 0, needs_attention: 0, upcoming: 0, dead: 0 };
}
