"use client";

import { ModalPaper, Tabs } from "@peppermint/ui";
import { RequireStaff } from "@/components/RequireStaff";
import { DenialsList } from "./denials/pages/DenialsList";
import { GrantsList } from "./grants/pages/GrantsList";

export function DirectAccessView() {
  return (
    <RequireStaff>
      <ModalPaper withBorder>
        <Tabs defaultValue="grants">
          <Tabs.List>
            <Tabs.Tab value="grants">Grants</Tabs.Tab>
            <Tabs.Tab value="denials">Denials</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="grants">
            <GrantsList />
          </Tabs.Panel>

          <Tabs.Panel value="denials">
            <DenialsList />
          </Tabs.Panel>
        </Tabs>
      </ModalPaper>
    </RequireStaff>
  );
}
