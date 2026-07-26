"use client";

import { RequireAuth } from "@/components/RequireAuth";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import { SuperadminLanding } from "../components/SuperadminLanding";
import { DashboardOverview } from "./DashboardOverview";

/**
 * `/admin` home. The Placement dashboard is now the home for the operational tiers
 * (`admin` / `lead_manager`); the platform `superadmin` — who is 403'd on every
 * dashboard section — gets a minimal identity/audit landing instead of an "Access
 * Forbidden" dead-end. `RequireAuth` gates the unauthenticated/verification cases
 * upstream, so once here a `user` (and its `authority_type`) is always present.
 */
function AdminHomeContent() {
  const { authorityType } = useCurrentUser();
  const canSeeDashboard =
    authorityType === "admin" || authorityType === "lead_manager";

  return canSeeDashboard ? <DashboardOverview /> : <SuperadminLanding />;
}

export function ModuleAdminHome() {
  return (
    <RequireAuth>
      <AdminHomeContent />
    </RequireAuth>
  );
}
