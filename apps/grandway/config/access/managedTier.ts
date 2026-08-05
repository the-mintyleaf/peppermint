"use client";

import { useMemo } from "react";
import type { AuthorityType } from "@/modules/admin/authenticate/_shared/authenticate.types";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";

/**
 * The one tier this account may create, or `null` if it may not create accounts.
 *
 * A fixed one-tier hierarchy, not a choice: `authenticate/INTEGRATION.md` §7 —
 * "`create`: `authority_type` must equal the tier the caller manages
 * (superadmin→admin, admin→lead_manager)", and `AUTH_INVALID_AUTHORITY` (403) is the
 * refusal for anything else. That is why the create form has no role picker and must
 * never grow one.
 *
 * Lives here rather than in the users module because it is derived from
 * `authority_type`, and `config/access` is the only place that reads it — the same
 * rule that keeps the `isAdmin` trap from reappearing. Both the form's copy and the
 * `POST /users/` payload read it, so the two cannot drift.
 */
export function getManagedTier(
  authorityType: AuthorityType | null,
): AuthorityType | null {
  switch (authorityType) {
    case "superadmin":
      return "admin";
    case "admin":
      return "lead_manager";
    default:
      return null;
  }
}

/** `getManagedTier` for the signed-in account. */
export function useManagedTier(): AuthorityType | null {
  const { authorityType } = useCurrentUser();
  return useMemo(() => getManagedTier(authorityType), [authorityType]);
}
