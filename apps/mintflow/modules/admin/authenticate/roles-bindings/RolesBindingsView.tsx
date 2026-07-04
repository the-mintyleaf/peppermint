"use client";

import { ModalPaper, Tabs } from "@peppermint/ui";
import { KeyIcon } from "@phosphor-icons/react/dist/csr/Key";
import { UsersThreeIcon } from "@phosphor-icons/react/dist/csr/UsersThree";

import { RequireStaff } from "@/components/RequireStaff";
import { BindingsList } from "./bindings/pages/BindingsList";
import { RolesList } from "./roles/pages/RolesList";

export function RolesBindingsView() {
  return (
    <RequireStaff>
      <ModalPaper withBorder>
        <Tabs defaultValue="roles">
          <Tabs.List>
            <Tabs.Tab
              value="roles"
              leftSection={<KeyIcon size={16} aria-hidden />}
            >
              Roles
            </Tabs.Tab>
            <Tabs.Tab
              value="bindings"
              leftSection={<UsersThreeIcon size={16} aria-hidden />}
            >
              Bindings
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="roles">
            <RolesList />
          </Tabs.Panel>
          <Tabs.Panel value="bindings">
            <BindingsList />
          </Tabs.Panel>
        </Tabs>
      </ModalPaper>
    </RequireStaff>
  );
}
