"use client";

import { ModalPaper, ModuleHeader, Stack } from "@peppermint/ui";
import { RequireAuth } from "@/components/RequireAuth";
import { SessionsTab } from "@/modules/admin/authenticate/account-settings";

/**
 * Standalone full-page view of the signed-in user's own device sessions — the same
 * `SessionsTab` used inside the account-settings modal, given its own nav entry and
 * route for a more deliberate review flow (`authenticate/docs/INTEGRATION.md` §7 —
 * "Manage my own devices").
 */
function MySessionsContent() {
  return (
    <>
      <ModuleHeader
        breadcrumbItems={[
          { label: "Home", href: "/admin" },
          { label: "My Sessions", href: "/admin/authenticate/sessions" },
        ]}
      />
      <ModalPaper withBorder>
        <Stack gap="md" p="lg">
          <SessionsTab
            title="My Sessions"
            description="Devices currently signed in to your account."
          />
        </Stack>
      </ModalPaper>
    </>
  );
}

export function ModuleMySessions() {
  return (
    <RequireAuth>
      <MySessionsContent />
    </RequireAuth>
  );
}
