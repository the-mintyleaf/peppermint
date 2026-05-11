import React from 'react';
import { Group, Title, TextInput, Button } from '@zetsel/ui';
import { MagnifyingGlass, Plus } from '@phosphor-icons/react';
import { useDataTableStore } from '../../../../wrappers/DataTableWrapper';
import type { ModuleInfo } from '../../DataTableShell.types';

interface TableHeaderProps {
  moduleInfo: ModuleInfo;
  newButtonHref?: string;
  onNewClick?: () => void;
}

export function TableHeader({ moduleInfo, newButtonHref, onNewClick }: TableHeaderProps) {
  const search = useDataTableStore((s) => s.search);
  const setSearch = useDataTableStore((s) => s.setSearch);

  function handleNew() {
    if (onNewClick) {
      onNewClick();
    } else if (newButtonHref) {
      window.location.href = newButtonHref;
    }
  }

  return (
    <Group justify="space-between" align="center" mb="md">
      <Title order={2}>{moduleInfo.title}</Title>
      <Group>
        <TextInput
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          leftSection={<MagnifyingGlass size={16} aria-label="Search" />}
        />
        {(onNewClick || newButtonHref) && (
          <Button
            leftSection={<Plus size={16} aria-label="New" />}
            onClick={handleNew}
          >
            New
          </Button>
        )}
      </Group>
    </Group>
  );
}
