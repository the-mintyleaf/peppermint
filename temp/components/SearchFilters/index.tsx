"use client";

import { Button, Group, Text, ThemeIcon } from "@mantine/core";
import { XIcon } from "@phosphor-icons/react";
import { DataTableWrapper } from "@settle/core";

export function DataTableShellSearchFilters() {
  const { filters, removeFilter } = DataTableWrapper.useDataTableWrapperStore();

  if (filters.length <= 0) {
    return null;
  }

  return (
    <Group gap={4} p="sm">
      <Text mr="xs" size="xs">
        Filters:
      </Text>
      {filters.map((filter: any, index: number) => {
        return (
          <Button
            key={index}
            variant="light"
            h={24}
            size="xs"
            rightSection={
              <ThemeIcon
                size="sm"
                variant="subtle"
                onClick={() => {
                  removeFilter(index);
                }}
              >
                <XIcon weight="bold" />
              </ThemeIcon>
            }
          >
            {filter.label} : {filter.value}
          </Button>
        );
      })}
    </Group>
  );
}
