"use client";

import { useEffect, useState } from "react";

import {
  ActionIcon,
  Button,
  Checkbox,
  Divider,
  Drawer,
  Group,
  Menu,
  Paper,
  Popover,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import {
  ArrowLeftIcon,
  CaretDownIcon,
  FunnelIcon,
  GearSixIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XIcon,
} from "@phosphor-icons/react";
import { usePathname } from "next/navigation";

import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { Tabs } from "@settle/admin";
import { DataTableWrapper } from "@settle/core";
import { PropDataTableToolbar } from "../../DataTableShell.type";
import { DataTableShellFilter } from "../TableFilters";
import { DataTableShellSearchFilters } from "../SearchFilters";

export function DataTableShellToolbar({
  moduleInfo,
  tabs,
  activeTab,
  onTabChange,
  filterList,
  hideFilters,
  customColumns,
  onToggleColumn,
  onResetColumns,
  sustained = false,
  newButtonHref,
  onNewClick,
  disableCreateButton = false,
}: PropDataTableToolbar) {
  // * CONTEXT

  const { setSearch } = DataTableWrapper.useDataTableWrapperStore();
  const pathname = usePathname();
  const finalHref = newButtonHref || `${pathname}/new`;
  const handleNewClick = sustained ? onNewClick : undefined;

  // * STATE

  const [svalue, setSValue] = useState<string>("");
  const [debouncedSearch] = useDebouncedValue(svalue, 200);
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure();

  // * EFFECT

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  // * FUNCTIONS

  return (
    <>
      {/* Mobile: Fixed bottom center buttons */}

      <Paper
        px="md"
        w="100%"
        hiddenFrom="lg" pos="fixed"
        bottom={0}
        left="50%"
        style={{ transform: "translateX(-50%)", zIndex: 100 }}>

        <Group
          justify="space-between"
          gap="xs"
        >
          <Group gap="xs">
            <Button
              variant="light"
              leftSection={<ArrowLeftIcon />}
            >
              Back to Home
            </Button>
          </Group>
          <Group gap={"xs"}>
            {/* Filter button */}
            <ActionIcon variant="subtle" size="lg" onClick={openDrawer}>
              <FunnelIcon size={20} />
            </ActionIcon>

            {/* New button */}
            {sustained && handleNewClick ? (
              <ActionIcon
                size="lg"
             
                onClick={handleNewClick}
                disabled={disableCreateButton}
              >
                <PlusIcon size={20} />
              </ActionIcon>
            ) : (
              <ActionIcon
                size="lg"
             
                component="a"
                href={disableCreateButton ? undefined : finalHref}
                disabled={disableCreateButton}
              >
                <PlusIcon size={20} />
              </ActionIcon>
            )}


          </Group>
        </Group>
      </Paper>

      {/* Mobile: Drawer with toolbar content */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        position="bottom"
        title="Filters & Options"
        size="auto"
      >
        <Stack gap="md" p="md">
          {/* Tabs */}
          {tabs.length > 0 && (
            <Menu>
              <Menu.Target>
                <Button
                  variant="light"
                  size="sm"
                  fullWidth
                  rightSection={<CaretDownIcon />}
                >
                  {tabs[activeTab]?.label || `All ${moduleInfo.name}`}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                {tabs.map((tab, index) => (
                  <Menu.Item
                    key={index}
                    onClick={() => {
                      onTabChange(index);
                      closeDrawer();
                    }}
                    bg={activeTab === index ? "var(--mantine-color-blue-light)" : undefined}
                  >
                    {tab.label}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
          )}

          {/* Search */}
          <TextInput
            leftSection={<MagnifyingGlassIcon />}
            size="sm"
            placeholder="Search ..."
            value={svalue}
            onChange={(e) => setSValue(e.target.value)}
          />

          {/* Filters */}
          <DataTableShellFilter filterList={filterList} />

          {/* Columns */}
          <Stack gap={0}>
            <Text px="sm" py="xs" size="xs" opacity={0.5}>
              Select columns to view
            </Text>
            <Divider />
            {customColumns.map((column: any, index: number) => {
              const checked = column.visible;
              return (
                <Button
                  justify="left"
                  radius={0}
                  variant="subtle"
                  key={column.accessor ?? index}
                  size="xs"
                  leftSection={<Checkbox checked={checked} size="xs" />}
                  onClick={() => onToggleColumn(index)}
                  style={{ color: "var(--mantine-color-text)" }}
                >
                  {column.header}
                </Button>
              );
            })}
            <Divider />
            <Button
              size="xs"
              variant="subtle"
              justify="left"
              leftSection={<XIcon weight="bold" />}
              styles={{ label: { paddingLeft: 4 } }}
              onClick={onResetColumns}
            >
              Reset to default.
            </Button>
          </Stack>
        </Stack>
      </Drawer>

      {/* Desktop: Regular toolbar */}
      <Group gap="xs" justify="space-between" h={40} visibleFrom="lg">
        <Group gap="xs">
          {tabs.length > 0 ? (
            <Tabs tabs={tabs} active={activeTab} onTabChange={onTabChange} />
          ) : (
            <Button variant="light" size="xs">
              All {moduleInfo.name}
            </Button>
          )}
        </Group>

        <Group gap={4}>
          <DataTableShellFilter filterList={filterList} />

          {/* Search */}
          <div suppressHydrationWarning>
            <TextInput
              miw={300}
              leftSection={<MagnifyingGlassIcon />}
              size="xs"
              placeholder="Search ..."
              value={svalue}
              onChange={(e) => setSValue(e.target.value)}
            />
          </div>

          <div suppressHydrationWarning>
            <Popover withArrow shadow="md">
              <Popover.Target>
                <Button
                  color="dark"
                  variant="white"
                  style={{
                    border: "1px solid var(--mantine-color-gray-3)",
                  }}
                  size="xs"
                  leftSection={<GearSixIcon />}
                  rightSection={<CaretDownIcon />}
                >
                  Columns
                </Button>
              </Popover.Target>
              <Popover.Dropdown p={0} w={200} style={{ backgroundColor: "var(--mantine-color-body)" }}>
                <Stack gap={0}>
                  <Text px="sm" py="xs" size="xs" opacity={0.5}>
                    Select columns to view
                  </Text>

                  <Divider />

                  {customColumns.map((column: any, index: number) => {
                    const checked = column.visible;

                    return (
                      <Button
                        justify="left"
                        radius={0}
                        variant="subtle"
                        key={column.accessor ?? index}
                        size="xs"
                        leftSection={<Checkbox checked={checked} size="xs" />}
                        onClick={() => onToggleColumn(index)}
                        style={{ color: "var(--mantine-color-text)" }}
                      >
                        {column.header}
                      </Button>
                    );
                  })}

                  <Divider />

                  <Button
                    size="xs"
                    variant="subtle"
                    justify="left"
                    leftSection={<XIcon weight="bold" />}
                    styles={{
                      label: {
                        paddingLeft: 4,
                      },
                    }}
                    onClick={onResetColumns}
                  >
                    Reset to default.
                  </Button>
                </Stack>
              </Popover.Dropdown>
            </Popover>
          </div>
        </Group>
      </Group>
    </>
  );
}
