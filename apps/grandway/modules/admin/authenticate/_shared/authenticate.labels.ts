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

/**
 * The tier as a lowercase noun, for use mid-sentence: "Manage lead manager accounts".
 * `AUTHORITY_LABELS` is Title Case because it labels a badge — splicing that into
 * prose gives "Manage Lead Manager accounts", which reads as a typo beside every
 * other module's sentence-case copy.
 */
export const AUTHORITY_NOUNS: Record<AuthorityType, string> = {
  superadmin: "superadmin",
  admin: "admin",
  lead_manager: "lead manager",
};

/**
 * The same noun with its indefinite article, for sentences that need one:
 * "This creates an admin account". Kept as data rather than derived from the first
 * letter, since that heuristic breaks on the next tier that starts with a vowel
 * sound but not a vowel (or vice versa).
 */
export const AUTHORITY_NOUNS_WITH_ARTICLE: Record<AuthorityType, string> = {
  superadmin: "a superadmin",
  admin: "an admin",
  lead_manager: "a lead manager",
};
