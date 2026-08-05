import type { AuthorityType } from "./authenticate.types";

/**
 * How an authority tier is written for a human. The wire values (`lead_manager`) are
 * never shown as-is.
 *
 * Shared rather than module-local because the users table, the create form, and the
 * create-modal title all name the same tier — if they disagree, an admin sees
 * "Lead Manager" in one place and "lead manager account" in another and has to work
 * out whether they are the same thing.
 */
export const AUTHORITY_LABELS: Record<AuthorityType, string> = {
  superadmin: "Superadmin",
  admin: "Admin",
  lead_manager: "Lead Manager",
};

/** Badge colours for the tiers, so the table and any tier badge elsewhere match. */
export const AUTHORITY_COLORS: Record<AuthorityType, string> = {
  superadmin: "grape",
  admin: "blue",
  lead_manager: "gray",
};
