"use client";

import { RequireCapability } from "@/components/RequireCapability";
import type { RequireLeadAccessProps } from "./RequireLeadAccess.types";

/**
 * Gate the funnel modules — Leads, Applicants, Journeys, Offers — behind the
 * `admin`/`lead_manager` tiers. Deliberately the mirror image of `RequireStaff`:
 * those backends 403 every `superadmin` call to keep the platform-recovery
 * credential out of business data.
 *
 * Keyed on `leads`, whose rule all four share.
 *
 * Catalogue, Clients and the Checklist lists still sit behind this gate today, but
 * they are Admin-only areas that only happen to match its rule. When they move, they
 * take their own capability (`catalogue`, `clients`, `checklists`) via
 * `RequireCapability` — do not widen this gate to keep covering them.
 */
export function RequireLeadAccess({ children }: RequireLeadAccessProps) {
  return <RequireCapability capability="leads">{children}</RequireCapability>;
}
