'use client';

import { useEffect, useState } from 'react';
import { Button, Stack, Text, TextInput } from '@peppermint/ui';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/csr/MagnifyingGlass';
import { useDebouncedValue } from '@peppermint/ui';
import { useTableStore } from '../../../../wrappers/DataTableWrapper';
import { ToolbarIconButton } from './ToolbarIconButton';

interface DataTableShellSearchMenuProps {
  /** When true, renders inline content without the icon popover wrapper. */
  inline?: boolean;
}

export function DataTableShellSearchMenu({
  inline = false,
}: DataTableShellSearchMenuProps) {
  const [opened, setOpened] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchInput, 300);

  const useTable = useTableStore();
  const search = useTable((s) => s.search);
  const setSearch = useTable((s) => s.setSearch);

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  useEffect(() => {
    if (opened && search && !searchInput) {
      setSearchInput(search);
    }
  }, [opened, search, searchInput]);

  const handleClose = () => {
    setOpened(false);
  };

  const content = (
    <Stack gap="xs">
      <Text size="xs" c="dimmed">
        Search across all fields
      </Text>
      <TextInput
        size="xs"
        placeholder="Search…"
        leftSection={<MagnifyingGlassIcon size={14} />}
        value={searchInput}
        onChange={(e) => setSearchInput(e.currentTarget.value)}
        autoFocus
      />
      {searchInput && (
        <Button
          size="xs"
          variant="subtle"
          onClick={() => {
            setSearchInput('');
            setSearch('');
          }}
        >
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
