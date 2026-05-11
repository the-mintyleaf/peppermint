import React from 'react';
import { Group, Badge, CloseButton, Select, TextInput } from '@zetsel/ui';
import { useDataTableStore } from '../../../../wrappers/DataTableWrapper';
import type { FilterDef, FilterState } from '../../../../wrappers/DataTableWrapper';

interface TableFiltersProps {
  filterList?: FilterDef[];
}

export function TableFilters({ filterList }: TableFiltersProps) {
  const filters = useDataTableStore((s) => s.filters);
  const setFilters = useDataTableStore((s) => s.setFilters);

  if (!filterList || filterList.length === 0) return null;

  function removeFilter(key: string) {
    setFilters(filters.filter((f) => f.key !== key));
  }

  function addOrUpdateFilter(update: FilterState) {
    const existing = filters.find((f) => f.key === update.key);
    if (existing) {
      setFilters(filters.map((f) => (f.key === update.key ? update : f)));
    } else {
      setFilters([...filters, update]);
    }
  }

  const activeFilters = filters.filter((f) => f.value !== '' && f.value !== null && f.value !== undefined);

  return (
    <Group mb="sm" gap="xs" wrap="wrap">
      {filterList.map((def) => {
        const active = filters.find((f) => f.key === def.key);
        if (def.type === 'select' && def.options) {
          return (
            <Select
              key={def.key}
              placeholder={def.label}
              data={def.options}
              value={active ? String(active.value) : null}
              onChange={(val) => {
                if (val) addOrUpdateFilter({ key: def.key, value: val });
                else removeFilter(def.key);
              }}
              clearable
              size="xs"
              style={{ minWidth: 140 }}
            />
          );
        }
        if (def.type === 'text') {
          return (
            <TextInput
              key={def.key}
              placeholder={def.label}
              value={active ? String(active.value) : ''}
              onChange={(e) => addOrUpdateFilter({ key: def.key, value: e.currentTarget.value })}
              size="xs"
              style={{ minWidth: 140 }}
            />
          );
        }
        return null;
      })}
      {activeFilters.map((f) => {
        const def = filterList.find((d) => d.key === f.key);
        return (
          <Badge key={f.key} variant="light" rightSection={
            <CloseButton
              size="xs"
              aria-label={`Remove ${def?.label ?? f.key} filter`}
              onClick={() => removeFilter(f.key)}
            />
          }>
            {def?.label ?? f.key}: {String(f.value)}
          </Badge>
        );
      })}
    </Group>
  );
}
