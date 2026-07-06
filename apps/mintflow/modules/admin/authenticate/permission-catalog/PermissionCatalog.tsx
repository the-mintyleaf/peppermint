"use client";

import { ModalPaper, ModuleHeader } from "@peppermint/ui";

import { RequireStaff } from "@/components/RequireStaff";
import { PermissionCatalogPanel } from "./components/PermissionCatalogPanel";

export function PermissionCatalog() {
  return (
    <RequireStaff>
      <ModuleHeader
        breadcrumbItems={[
          {
            label: "Permission Catalog",
            href: "/admin/authenticate/permission-catalog",
          },
        ]}
      />
      <ModalPaper withBorder>
        <PermissionCatalogPanel />
      </ModalPaper>
    </RequireStaff>
  );
}
