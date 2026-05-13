"use client";

import { ActionIcon, AppShell, Divider, Group, Stack, Text } from "@zetsel/ui";
import {
  KanbanIcon,
  ArrowLineLeftIcon,
  ArrowLineRightIcon,
  MagnifyingGlass,
} from "@phosphor-icons/react";

export function AdminShellNavbar({
  collapsed,
  onToggle,
  onOpen,
  onClose,
}: {
  collapsed: boolean;
  onToggle: () => void;
  onOpen: () => void;
  onClose: () => void;
}) {
  return (
    <AppShell.Navbar
      bg="none"
      style={{
        border: "none",
      }}
    >
      {collapsed && (
        <AppShell.Section component={Group} p="sm" justify="center">
          <ActionIcon size="md" variant="subtle" color="gray" onClick={onOpen}>
            <ArrowLineRightIcon weight="bold" size={16} />
          </ActionIcon>
        </AppShell.Section>
      )}

      <Divider />

      <AppShell.Section component={Group} p="sm" justify="space-between">
        <Group gap={"xs"} w={collapsed ? 50 : "auto"} justify="center">
          <KanbanIcon weight="fill" size={16} />
          <Text size="xs" fw={600} hidden={collapsed}>
            zetsel.admin
          </Text>
        </Group>

        {!collapsed && (
          <ActionIcon
            size="sm"
            variant="subtle"
            color="gray"
            onClick={onToggle}
          >
            <ArrowLineLeftIcon weight="bold" size={16} />
          </ActionIcon>
        )}
      </AppShell.Section>

      <Divider />

      <AppShell.Section component={Group} p="sm" gap="xs" opacity={0.5}>
        <MagnifyingGlass weight="bold" size={16} />
        <Text size="xs" hidden={collapsed}>
          Search Modules.
        </Text>
      </AppShell.Section>

      <Divider />

      <AppShell.Section
        grow
        component={Stack}
        p="sm"
        justify="space-between"
      ></AppShell.Section>

      <Divider />

      <AppShell.Section component={Group} p="sm">
        <Text size="xs">Profile</Text>
      </AppShell.Section>
    </AppShell.Navbar>
  );
}
