"use client";

import { ActionIcon, Menu, modals } from "@peppermint/ui";
import { DotsThreeVerticalIcon } from "@phosphor-icons/react/dist/csr/DotsThreeVertical";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";

import type { DelegationRowActionsMenuProps } from "./DelegationRowActionsMenu.types";
import { RevokeDelegationModalContent } from "./RevokeDelegationModalContent";

export function DelegationRowActionsMenu({
  delegation,
}: DelegationRowActionsMenuProps) {
  function handleRevoke() {
    modals.open({
      title: "Revoke delegation",
      children: <RevokeDelegationModalContent delegationId={delegation.id} />,
    });
  }

  return (
    <Menu position="bottom-end" withinPortal>
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray" aria-label="Row actions">
          <DotsThreeVerticalIcon size={16} aria-hidden />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          leftSection={<ProhibitIcon size={14} aria-hidden />}
          color="red"
          disabled={
            delegation.status !== "active" && delegation.status !== "planned"
          }
          onClick={handleRevoke}
        >
          Revoke
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
