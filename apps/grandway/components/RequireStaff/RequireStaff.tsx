"use client";

import { RequireCapability } from "@/components/RequireCapability";
import type { RequireStaffProps } from "./RequireStaff.types";

/**
 * Gate the account-administration areas — Users and Audit — behind the `admin`/
 * `superadmin` baseline. A `lead_manager` never reaches
 * `/admin/authenticate/users` or `/admin/audit`.
 *
 * Keyed on `users`, which `config/access` grants to exactly those two tiers. Audit
 * has its own capability with the same rule; if the two ever diverge, gate `/admin/
 * audit` on `audit` rather than widening this one.
 */
export function RequireStaff({ children }: RequireStaffProps) {
  return <RequireCapability capability="users">{children}</RequireCapability>;
}
