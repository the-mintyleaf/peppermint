"use client";

import { Menu } from "@peppermint/ui";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import { StatusSwitchButton } from "@/components/StatusSwitchButton";
import { useSignatureLifecycle } from "../useSignatureLifecycle";
import type { SignatureStatusCellProps } from "./SignatureStatusCell.types";

export function SignatureStatusCell({ signature }: SignatureStatusCellProps) {
  const { isActive, isPending, openDeactivate, openReactivate } =
    useSignatureLifecycle(signature);

  return (
    <Menu position="bottom-start" withinPortal>
      <Menu.Target>
        <StatusSwitchButton
          label={isActive ? "Active" : "Inactive"}
          color={isActive ? "teal" : "gray"}
          disabled={isPending}
          aria-label={`Change status for ${signature.name}, currently ${isActive ? "Active" : "Inactive"}`}
        />
      </Menu.Target>
      <Menu.Dropdown>
        {isActive ? (
          <Menu.Item
            color="red"
            leftSection={<ProhibitIcon size={16} aria-hidden />}
            disabled={isPending}
            onClick={openDeactivate}
          >
            Set inactive
          </Menu.Item>
        ) : (
          <Menu.Item
            color="teal"
            leftSection={<CheckCircleIcon size={16} aria-hidden />}
            disabled={isPending}
            onClick={openReactivate}
          >
            Set active
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
