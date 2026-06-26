"use client";

import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { ActionIcon, Popover, Tooltip } from "@peppermint/ui";

interface ToolbarIconButtonProps {
  label: string;
  icon: ReactNode;
  opened: boolean;
  onToggle: () => void;
  onClose: () => void;
  disabled?: boolean;
  children: ReactNode;
  width?: number;
}

function withDuotoneWeight(icon: ReactNode): ReactNode {
  if (!isValidElement(icon)) return icon;
  return cloneElement(icon as ReactElement<{ weight?: string }>, {
    weight: "duotone",
  });
}

export function ToolbarIconButton({
  label,
  icon,
  opened,
  onToggle,
  onClose,
  disabled = false,
  children,
  width = 260,
}: ToolbarIconButtonProps) {
  const duotoneIcon = withDuotoneWeight(icon);

  if (disabled) {
    return (
      <Tooltip label={label} withArrow position="bottom">
        <ActionIcon
          variant="subtle"
          color="gray"
          size="md"
          aria-label={label}
          disabled
        >
          {duotoneIcon}
        </ActionIcon>
      </Tooltip>
    );
  }

  return (
    <Popover
      opened={opened}
      onChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      position="bottom-end"
      shadow="md"
      width={width}
      withArrow
    >
      <Popover.Target>
        <Tooltip label={label} withArrow position="bottom">
          <ActionIcon
            variant="subtle"
            color="gray"
            size="md"
            aria-label={label}
            disabled={disabled}
            onClick={onToggle}
          >
            {duotoneIcon}
          </ActionIcon>
        </Tooltip>
      </Popover.Target>
      <Popover.Dropdown p="sm">{children}</Popover.Dropdown>
    </Popover>
  );
}
