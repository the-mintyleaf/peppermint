"use client";

import { useEffect, useRef, useState } from "react";
import {
  ActionIcon,
  Button,
  Popover,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from "@peppermint/ui";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";

import type { OrganizationsSearchMenuProps } from "./OrganizationsSearchMenu.types";

export function OrganizationsSearchMenu({
  value,
  onChange,
}: OrganizationsSearchMenuProps) {
  const [opened, setOpened] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (opened) {
      inputRef.current?.focus();
    }
  }, [opened]);

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom-end"
      shadow="md"
      width={280}
      withArrow
    >
      <Popover.Target>
        <Tooltip label="Search" withArrow position="bottom">
          <ActionIcon
            variant="subtle"
            color="gray"
            size="md"
            aria-label="Search"
            onClick={() => setOpened((v) => !v)}
          >
            <MagnifyingGlassIcon size={18} weight="duotone" />
          </ActionIcon>
        </Tooltip>
      </Popover.Target>
      <Popover.Dropdown p="sm">
        <Stack gap="xs">
          <Text size="xs" c="dimmed">
            Search by name or code
          </Text>
          <TextInput
            ref={inputRef}
            size="xs"
            placeholder="Search…"
            leftSection={<MagnifyingGlassIcon size={14} />}
            value={value}
            onChange={(event) => onChange(event.currentTarget.value)}
          />
          {value.trim().length > 0 && (
            <Button size="xs" variant="subtle" onClick={() => onChange("")}>
              Clear search
            </Button>
          )}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
