"use client";

import type { ComponentType } from "react";

import { Button, Menu } from "@mantine/core";
import {
  CalendarIcon,
  CaretCircleDownIcon,
  CaretDownIcon,
  HashIcon,
  TextAaIcon,
  XIcon,
} from "@phosphor-icons/react";

import { randomId } from "@mantine/hooks";
import { DataTableWrapper } from "@settle/core";

// default icons based on filter type
const typeMap = {
  select: CaretCircleDownIcon,
  text: TextAaIcon,
  number: HashIcon,
  date: CalendarIcon,
};

type FilterType = keyof typeof typeMap;

type FilterConfig = {
  label: string;
  type?: FilterType; // "select" | "text" | "number" | "date"
  icon?: ComponentType<any>; // optional custom icon component
};

type DataTableShellFilterProps = {
  filterList: FilterConfig[];
};

export function DataTableShellFilter({
  filterList,
}: DataTableShellFilterProps) {
  const { addFilter, resetFilter } =
    DataTableWrapper.useDataTableWrapperStore();

  return (
    <>
      {/* <Menu withArrow>
        <Menu.Target>
          <Button variant="subtle" size="xs" rightSection={<CaretDownIcon />}>
            Filters
          </Button>
        </Menu.Target>

        <Menu.Dropdown w={250}>
          <Menu.Label>Add Filter</Menu.Label>

          {filterList.map((filter, index) => {
            // priority: custom icon > type-based default > HashIcon
            const Icon =
              filter.icon ||
              (filter.type ? typeMap[filter.type] : undefined) ||
              HashIcon;

            return (
              <Menu.Item
                fw={600}
                key={index}
                onClick={() => {
                  addFilter({
                    type: "single",
                    key: randomId(),
                    value: "",
                    ...filter,
                  });
                }}
                leftSection={<Icon weight="duotone" />}
              >
                {filter.label}
              </Menu.Item>
            );
          })}

          <Menu.Divider />

          <Menu.Item
            fw={600}
            leftSection={<XIcon weight="bold" />}
            onClick={() => resetFilter()}
          >
            Clear Filters
          </Menu.Item>
        </Menu.Dropdown>
      </Menu> */}
    </>
  );
}
