"use client";

import {
  ActionIcon,
  AppShell,
  Divider,
  Group,
  Stack,
  Text,
  UnstyledButton,
} from "@zetsel/ui";
import { KanbanIcon } from "@phosphor-icons/react/dist/csr/Kanban";
import { ArrowLineLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLineLeft";
import { ArrowLineRightIcon } from "@phosphor-icons/react/dist/csr/ArrowLineRight";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import type { AdminShellNav } from "../../AdminShell.types";

interface AdminShellNavbarProps {
  collapsed: boolean;
  onToggle: () => void;
  onOpen: () => void;
  onClose: () => void;
  nav: AdminShellNav;
  pathname?: string;
}

export function AdminShellNavbar({
  collapsed,
  onToggle,
  onOpen,
  nav,
  pathname = "",
}: AdminShellNavbarProps) {
  return (
    <AppShell.Navbar bg="none" style={{ border: "none" }}>
      {collapsed && (
        <AppShell.Section component={Group} p="sm" justify="center">
          <ActionIcon size="md" variant="subtle" color="gray" onClick={onOpen}>
            <ArrowLineRightIcon weight="bold" size={16} />
          </ActionIcon>
        </AppShell.Section>
      )}

      <Divider />

      <AppShell.Section component={Group} p="sm" justify="space-between">
        <Group gap="xs" w={collapsed ? 50 : "auto"} justify="center">
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

      <AppShell.Section
        component={Group}
        p="sm"
        gap="xs"
        style={{ opacity: 0.5 }}
      >
        <MagnifyingGlassIcon weight="bold" size={16} />
        <Text size="xs" hidden={collapsed}>
          Search Modules.
        </Text>
      </AppShell.Section>

      <Divider />

      <AppShell.Section
        grow
        component={Stack}
        p={0}
        gap={0}
        style={{ overflowY: "auto" }}
      >
        {nav.map((group) => (
          <Stack key={group.label} gap={0} mb={4}>
            {!collapsed && (
              <Text
                my="xs"
                size="10px"
                fw={600}
                tt="uppercase"
                c="dimmed"
                px="sm"
                pt="sm"
                pb={4}
                style={{ letterSpacing: "0.08em" }}
              >
                {group.label}
              </Text>
            )}
            {collapsed && <Divider my={4} />}

            {group.items.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;

              return (
                <UnstyledButton
                  key={item.href}
                  component="a"
                  href={item.href}
                  px="sm"
                  py={6}
                  mx={4}
                  style={{
                    borderRadius: "var(--mantine-radius-sm)",
                    backgroundColor: isActive
                      ? "var(--mantine-color-brand-0)"
                      : "transparent",
                    borderLeft: isActive
                      ? "2px solid var(--mantine-color-brand-7)"
                      : "2px solid transparent",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: isActive
                      ? "var(--mantine-color-brand-7)"
                      : "var(--mantine-color-dark-9)",
                  }}
                >
                  {Icon && (
                    <Icon
                      size={13}
                      weight={"fill"}
                      aria-hidden
                      style={{ flexShrink: 0 }}
                    />
                  )}
                  {!collapsed && (
                    <Group justify="space-between" style={{ flex: 1 }}>
                      <Text
                        size="xs"
                        fw={isActive ? 600 : 400}
                        style={{ color: "inherit" }}
                      >
                        {item.label}
                      </Text>
                      {item.badge && (
                        <Text
                          size="10px"
                          fw={600}
                          tt="uppercase"
                          c={isActive ? "blue.6" : "dimmed"}
                          style={{ letterSpacing: "0.05em" }}
                        >
                          {item.badge}
                        </Text>
                      )}
                    </Group>
                  )}
                </UnstyledButton>
              );
            })}
          </Stack>
        ))}
      </AppShell.Section>

      <Divider />

      <AppShell.Section component={Group} p="sm">
        <Text size="xs">Profile</Text>
      </AppShell.Section>
    </AppShell.Navbar>
  );
}
