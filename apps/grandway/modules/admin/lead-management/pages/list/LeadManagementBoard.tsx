"use client";

import { Center, ModalPaper, ModuleHeader, Text } from "@peppermint/ui";
import { RequireLeadAccess } from "@/components/RequireLeadAccess";

/**
 * Placeholder for the categorized leads board — Phase 2 replaces this body with
 * the `ModalTableShell` (tabs, columns, search/filter) once categorization lands.
 * This phase only proves the route, gate, and data layer wire up end to end.
 */
function LeadManagementBoardContent() {
  return (
    <>
      <ModuleHeader
        breadcrumbItems={[{ label: "Leads", href: "/admin/lead-management" }]}
      />
      <ModalPaper withBorder>
        <Center h="100%" mih={400}>
          <Text size="sm" c="dimmed">
            Loading leads…
          </Text>
        </Center>
      </ModalPaper>
    </>
  );
}

export function ModuleLeadManagement() {
  return (
    <RequireLeadAccess>
      <LeadManagementBoardContent />
    </RequireLeadAccess>
  );
}
