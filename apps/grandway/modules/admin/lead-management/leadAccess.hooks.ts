"use client";

import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";

export interface LeadAccess {
  /**
   * The exact `admin` tier — the only one the leads backend lets delete,
   * restore, convert, list `?deleted=true`, or edit anyone's note. Narrower
   * than `useCurrentUser().isAdmin`, which is also true for `superadmin`
   * (refused 403 on every leads endpoint).
   */
  isLeadAdmin: boolean;
  /** The signed-in user's id — note edit/delete shows on notes they wrote. */
  currentUserId: string | null;
}

/**
 * The one place this module turns the account into lead permissions.
 * `config/access` has no lead-admin capability (its `leads` flag is true for
 * both tiers), and this module already gated Admin-only levers on the exact
 * `admin` tier — so the comparison lives here once instead of inline in every
 * component. Swap the body for a capability when one exists.
 */
export function useLeadAccess(): LeadAccess {
  const { authorityType, user } = useCurrentUser();
  return {
    isLeadAdmin: authorityType === "admin",
    currentUserId: user?.id ?? null,
  };
}
