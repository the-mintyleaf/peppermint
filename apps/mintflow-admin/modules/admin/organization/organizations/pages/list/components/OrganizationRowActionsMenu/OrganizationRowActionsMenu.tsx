"use client";

import { ActionIcon, Menu } from "@peppermint/ui";
import { DotsThreeVerticalIcon } from "@phosphor-icons/react/dist/csr/DotsThreeVertical";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";

import type { OrganizationRowActionsMenuProps } from "./OrganizationRowActionsMenu.types";

export function OrganizationRowActionsMenu({
  organization,
  onSelect,
}: OrganizationRowActionsMenuProps) {
  return (
    <div onClick={(event) => event.stopPropagation()}>
      <Menu position="bottom-end" withinPortal>
        <Menu.Target>
          <ActionIcon variant="subtle" color="gray" aria-label="Row actions">
            <DotsThreeVerticalIcon size={16} aria-hidden />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            leftSection={<EyeIcon size={14} aria-hidden />}
            onClick={() => onSelect(organization)}
          >
            View overview
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </div>
  );
}
