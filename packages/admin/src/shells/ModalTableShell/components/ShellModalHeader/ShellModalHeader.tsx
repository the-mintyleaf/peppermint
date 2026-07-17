"use client";

import { ActionIcon, Divider, Group, Text } from "@peppermint/ui";
import { ArrowsOutSimpleIcon } from "@phosphor-icons/react/dist/csr/ArrowsOutSimple";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import {
  SHELL_MODAL_HEADER,
  shellModalHeaderActionStyle,
} from "./shellModalHeader.styles";
import type { ShellModalHeaderProps } from "./ShellModalHeader.types";

export function ShellModalHeader({
  parentLabel,
  currentLabel,
  onClose,
}: ShellModalHeaderProps) {
  return (
    <>
      <Group
        justify="space-between"
        px={SHELL_MODAL_HEADER.paddingX}
        py={SHELL_MODAL_HEADER.paddingY}
        wrap="nowrap"
      >
        <Group gap={8} wrap="nowrap">
          <Text size="xs" c="dimmed">
            {parentLabel && (
              <>
                {parentLabel}
                <Text span c="dimmed" mx={6}>
                  /
                </Text>
              </>
            )}
            <Text span c="dark">
              {currentLabel}
            </Text>
          </Text>
        </Group>
        <ActionIcon
          variant="default"
          size="md"
          aria-label="Close"
          onClick={onClose}
          style={shellModalHeaderActionStyle}
        >
          <XIcon size={14} />
        </ActionIcon>
      </Group>
      <Divider />
    </>
  );
}
