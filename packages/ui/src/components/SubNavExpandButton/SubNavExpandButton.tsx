"use client";

import { ActionIcon, Divider } from "@mantine/core";
import { ArrowLineRightIcon } from "@phosphor-icons/react/dist/csr/ArrowLineRight";
import { useSubNavStore } from "./SubNavExpandButton.store";

export function SubNavExpandButton() {
  const subNavCollapsed = useSubNavStore((s) => s.subNavCollapsed);
  const expand = useSubNavStore((s) => s.expand);

  if (!subNavCollapsed) return null;

  return (
    <>
      <ActionIcon
        size="md"
        variant="subtle"
        color="gray.0"
        onClick={expand}
        aria-label="Expand sub navigation"
      >
        <ArrowLineRightIcon weight="fill" size={16} />
      </ActionIcon>
      <Divider orientation="vertical" mx="xs" />
    </>
  );
}
