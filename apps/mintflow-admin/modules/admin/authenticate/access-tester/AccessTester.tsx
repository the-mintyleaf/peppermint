"use client";

import { ModalPaper, ModuleHeader } from "@peppermint/ui";

import { RequireStaff } from "@/components/RequireStaff";
import { AccessTesterPanel } from "./components/AccessTesterPanel";

export function AccessTester() {
  return (
    <RequireStaff>
      <ModuleHeader
        breadcrumbItems={[
          { label: "Access Tester", href: "/admin/authenticate/access-tester" },
        ]}
      />
      <ModalPaper withBorder>
        <AccessTesterPanel />
      </ModalPaper>
    </RequireStaff>
  );
}
