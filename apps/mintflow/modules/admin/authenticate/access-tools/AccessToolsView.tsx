"use client";

import { ModalPaper, ModuleHeader, Tabs } from "@peppermint/ui";
import { ListMagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/ListMagnifyingGlass";
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/csr/ShieldCheck";
import { RequireStaff } from "@/components/RequireStaff";
import { AccessTesterPanel } from "./components/AccessTesterPanel";
import { PermissionCatalogPanel } from "./components/PermissionCatalogPanel";

export function AccessToolsView() {
  return (
    <RequireStaff>
      <ModuleHeader
        breadcrumbItems={[
          { label: "Access Tools", href: "/admin/authenticate/access-tools" },
        ]}
      />
      <ModalPaper withBorder>
        <Tabs defaultValue="catalog">
          <Tabs.List>
            <Tabs.Tab
              value="catalog"
              leftSection={
                <ListMagnifyingGlassIcon size={16} aria-label="Catalog" />
              }
            >
              Permission Catalog
            </Tabs.Tab>
            <Tabs.Tab
              value="tester"
              leftSection={<ShieldCheckIcon size={16} aria-label="Tester" />}
            >
              Access Tester
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="catalog">
            <PermissionCatalogPanel />
          </Tabs.Panel>
          <Tabs.Panel value="tester">
            <AccessTesterPanel />
          </Tabs.Panel>
        </Tabs>
      </ModalPaper>
    </RequireStaff>
  );
}
