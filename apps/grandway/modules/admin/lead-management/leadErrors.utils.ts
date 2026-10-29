import { getApiError } from "@/lib/authErrorMessages";

/**
 * 409s that mean "this client's copy of the lead is out of date": someone
 * deleted, restored or converted it since it loaded. `useAppMutation` only
 * invalidates on success, so every lead write refetches the lead and the
 * board when it is refused with one of these — the drawer, board and
 * dashboard then show the lead's real state instead of the stale one.
 */
const STALE_LEAD_CODES = new Set([
  "LEADS_LEAD_DELETED",
  "LEADS_LEAD_NOT_DELETED",
  "LEADS_LEAD_ALREADY_CONVERTED",
]);

export function isStaleLeadError(error: unknown): boolean {
  return STALE_LEAD_CODES.has(getApiError(error).code);
}
