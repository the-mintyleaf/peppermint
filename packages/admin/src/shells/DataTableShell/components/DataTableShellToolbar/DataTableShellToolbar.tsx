"use client";

import {
  ActionIcon,
  Button,
  Center,
  Drawer,
  Group,
  Menu,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  useComputedColorScheme,
} from "@peppermint/ui";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import { FunnelIcon } from "@phosphor-icons/react/dist/csr/Funnel";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { useDisclosure } from "@peppermint/ui";
import { useDataTableShellContext } from "../../DataTableShell.context";
import type { DataTableShellToolbarProps } from "../../DataTableShell.types";
import { ColumnToggleList } from "./ColumnToggleList";
import { DataTableShellColumnsMenu } from "./DataTableShellColumnsMenu";
import { DataTableShellFilterMenu } from "./DataTableShellFilterMenu";
import { DataTableShellSearchMenu } from "./DataTableShellSearchMenu";
import { DataTableShellSettingsMenu } from "./DataTableShellSettingsMenu";
import { getColumnKey, getColumnLabel } from "./toolbar.utils";
import { useTableStore } from "../../../../wrappers/DataTableWrapper";

export function DataTableShellToolbar<T extends Record<string, unknown>>({
  moduleInfo,
  columns,
  tabs = [],
  basePath,
  newButtonHref,
  onNewClick,
  disableCreateButton = false,
  sustained = false,
}: DataTableShellToolbarProps<T>) {
  const { activeTab, setActiveTab } = useDataTableShellContext<T>();
  const colorScheme = useComputedColorScheme("light");
  const displayLabel = moduleInfo.label ?? moduleInfo.name;
  const finalHref = newButtonHref ?? (basePath ? `${basePath}/new` : undefined);
  const showAddButton =
    !disableCreateButton &&
    (sustained ? !!onNewClick : !!(basePath || newButtonHref));

  const useTable = useTableStore();
  const columnVisibility = useTable((s) => s.columnVisibility);
  const toggleColumn = useTable((s) => s.toggleColumn);

  const [drawerOpened, { open: openDrawer, close: closeDrawer }] =
    useDisclosure(false);

  const isColumnVisible = (key: string, defaultVisible = true): boolean => {
    if (!(key in columnVisibility)) return defaultVisible;
    return columnVisibility[key] !== false;
  };

  const handleResetColumns = () => {
    columns.forEach((col) => {
      const key = getColumnKey(col);
      toggleColumn(key, col.defaultVisible !== false);
    });
  };

  const columnToggles = columns.map((col) => {
    const key = getColumnKey(col);
    return {
      key,
      label: getColumnLabel(col),
      visible: isColumnVisible(key, col.defaultVisible !== false),
    };
  });

  const activeTabLabel = tabs[activeTab]?.label ?? `All ${displayLabel}`;

  const addButton = showAddButton ? (
    sustained && onNewClick ? (
      <Button
        size="xs"
        color="brand"
        rightSection={<PlusIcon size={13} weight="bold" />}
        onClick={onNewClick}
      >
        Add
      </Button>
    ) : (
      <Button
        component="a"
        size="xs"
        color="brand"
        href={finalHref}
        rightSection={<PlusIcon size={13} weight="bold" />}
        suppressHydrationWarning
      >
        Add
      </Button>
    )
  ) : null;

  return (
    <>
      {/* ── Mobile: fixed bottom bar ─────────────────────────────────────── */}
      <Paper
        px="md"
        py="xs"
        w="100%"
        hiddenFrom="lg"
        pos="fixed"
        bottom={0}
        left="50%"
        style={{ transform: "translateX(-50%)", zIndex: 100 }}
        withBorder
      >
        <Group justify="space-between">
          <Button
            variant="subtle"
            size="xs"
            leftSection={<ArrowLeftIcon size={13} />}
          >
            Back
          </Button>

          <Group gap={4}>
            <ActionIcon
              variant="subtle"
              size="lg"
              aria-label="Open filters and options"
              onClick={openDrawer}
            >
              <FunnelIcon size={18} weight="duotone" />
            </ActionIcon>

            {showAddButton &&
              (sustained && onNewClick ? (
                <ActionIcon
                  size="lg"
                  color="brand"
                  aria-label="Add"
                  onClick={onNewClick}
                >
                  <PlusIcon size={18} />
                </ActionIcon>
              ) : (
                <ActionIcon
                  component="a"
                  size="lg"
                  color="brand"
                  href={finalHref}
                  aria-label="Add"
                  suppressHydrationWarning
                >
                  <PlusIcon size={18} />
                </ActionIcon>
              ))}
          </Group>
        </Group>
      </Paper>

      {/* ── Mobile: filter drawer ─────────────────────────────────────────── */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        position="bottom"
        title="Filters & Options"
        size="auto"
      >
        <Stack gap="md" p="md">
          {tabs.length > 0 && (
            <Menu>
              <Menu.Target>
                <Button
                  variant="light"
                  size="sm"
                  fullWidth
                  rightSection={<CaretDownIcon size={13} />}
                >
                  {activeTabLabel}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                {tabs.map((tab, index) => {
                  const IconComponent = tab.icon as React.ComponentType<any>;
                  return (
                    <Menu.Item
                      key={index}
                      onClick={() => {
                        setActiveTab(index);
                        closeDrawer();
                      }}
                      bg={
                        activeTab === index
                          ? "var(--mantine-color-blue-light)"
                          : undefined
                      }
                      leftSection={IconComponent && <IconComponent size={16} />}
                    >
                      {tab.label}
                    </Menu.Item>
                  );
                })}
              </Menu.Dropdown>
            </Menu>
          )}

          <DataTableShellSearchMenu inline />
          <DataTableShellFilterMenu
            columns={columns}
            inline
            onApplied={closeDrawer}
          />

          <ColumnToggleList
            columnToggles={columnToggles}
            toggleColumn={toggleColumn}
            handleResetColumns={handleResetColumns}
          />
        </Stack>
      </Drawer>

      {/* ── Desktop: toolbar row ──────────────────────────────────────────── */}
      <Group gap="xs" justify="space-between" visibleFrom="lg">
        {tabs.length > 0 ? (
          <SegmentedControl
            withItemsBorders={false}
            value={String(activeTab)}
            onChange={(value) => setActiveTab(Number(value))}
            data={tabs.map((tab, index) => {
              const IconComponent = tab.icon as React.ComponentType<any>;
              return {
                label: (
                  <Center style={{ gap: 8 }}>
                    {IconComponent && (
                      <IconComponent
                        weight="duotone"
                        color="var(--mantine-color-brand-5)"
                        size={14}
                      />
                    )}
                    <span>{tab.label}</span>
                  </Center>
                ),
                value: String(index),
              };
            })}
            size="sm"
            color={colorScheme === "dark" ? "dark.4" : "white"}
            autoContrast
            styles={{
              label: {
                paddingInline: 10,
                fontSize: "var(--mantine-font-size-xs)",
              },
            }}
          />
        ) : (
          <Text fw={700} size="xs">
            All {displayLabel}
          </Text>
        )}

        <Group gap={4} wrap="nowrap">
          <DataTableShellFilterMenu columns={columns} />
          <DataTableShellSearchMenu />
          <DataTableShellSettingsMenu />
          <DataTableShellColumnsMenu columns={columns} />
          {addButton}
        </Group>
      </Group>
    </>
  );
}
