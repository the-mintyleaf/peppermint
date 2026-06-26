"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Stack, Text, TextInput } from "@peppermint/ui";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { useTableStore } from "../../../../wrappers/DataTableWrapper";
import { ToolbarIconButton } from "./ToolbarIconButton";

interface DataTableShellSearchMenuProps {
  /** When true, renders inline content without the icon popover wrapper. */
  inline?: boolean;
}

export function DataTableShellSearchMenu({
  inline = false,
}: DataTableShellSearchMenuProps) {
  const [opened, setOpened] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const useTable = useTableStore();
  const search = useTable((s) => s.search);
  const setSearch = useTable((s) => s.setSearch);

  useEffect(() => {
    if (opened) {
      inputRef.current?.focus();
    }
  }, [opened]);

  const handleClose = () => {
    setOpened(false);
  };

  const content = (
    <Stack gap="xs">
      <Text size="xs" c="dimmed">
        Search across all fields
      </Text>
      <TextInput
        ref={inputRef}
        size="xs"
        placeholder="Search…"
        leftSection={<MagnifyingGlassIcon size={14} />}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      {search.trim().length > 0 && (
        <Button size="xs" variant="subtle" onClick={() => setSearch("")}>
          Clear search
        </Button>
      )}
    </Stack>
  );

  if (inline) {
    return content;
  }

  return (
    <ToolbarIconButton
      label="Search"
      icon={<MagnifyingGlassIcon size={18} />}
      opened={opened}
      onToggle={() => setOpened((v) => !v)}
      onClose={handleClose}
      width={280}
    >
      {content}
    </ToolbarIconButton>
  );
}
