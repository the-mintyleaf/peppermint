"use client";

import {
  ActionIcon,
  AppShell,
  Badge,
  Button,
  Divider,
  Group,
  Indicator,
  Stack,
  Text,
  UnstyledButton,
} from "@zetsel/ui";
import { KanbanIcon } from "@phosphor-icons/react/dist/csr/Kanban";
import { ArrowLineLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLineLeft";
import { ArrowLineRightIcon } from "@phosphor-icons/react/dist/csr/ArrowLineRight";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { Bell as BellIcon } from "@phosphor-icons/react/dist/csr/Bell";
import { SpeakerLow as SpeakerLowIcon } from "@phosphor-icons/react/dist/csr/SpeakerLow";
import { ArrowUpRight as ArrowUpRightIcon } from "@phosphor-icons/react/dist/csr/ArrowUpRight";
import { UserInfoPopover } from "./UserInfoPopover";
import type { AdminShellNav, AdminShellHeaderConfig } from "../../AdminShell.types";

interface AdminShellNavbarProps {
  collapsed: boolean;
  onToggle: () => void;
  onOpen: () => void;
  onClose: () => void;
  nav: AdminShellNav;
  pathname?: string;
  headerConfig?: AdminShellHeaderConfig;
}

export function AdminShellNavbar({
  collapsed,
  onToggle,
  onOpen,
  nav,
  pathname = "",
  headerConfig,
}: AdminShellNavbarProps) {
  const defaultGreeting = `Hello ${headerConfig?.adminName || "Anamol"}!\nLet's begin your day!`;
  const greeting = headerConfig?.greeting || defaultGreeting;
  const actionButtons = headerConfig?.actionButtons || [];

  return (
    <AppShell.Navbar bg="dark.9" style={{ border: "none", color: "white" }}>
      {collapsed && (
        <AppShell.Section component={Group} p="md" justify="center">
          <ActionIcon size="md" variant="subtle" color="white" onClick={onOpen}>
            <ArrowLineRightIcon weight="bold" size={16} />
          </ActionIcon>
        </AppShell.Section>
      )}

      <Divider color="dark" />

      <AppShell.Section component={Group} p="md" justify="space-between">
        <Group gap="xs" w={collapsed ? 50 : "auto"} justify="center">
          <KanbanIcon weight="fill" size={16} style={{ color: "white" }} />
          <Text size="md" fw={300} hidden={collapsed} c="white">
            zetsel.admin
          </Text>
        </Group>

        {!collapsed && (
          <ActionIcon
            size="sm"
            variant="subtle"
            color="white"
            onClick={onToggle}
          >
            <ArrowLineLeftIcon weight="fill" size={14} />
          </ActionIcon>
        )}
      </AppShell.Section>

      <Divider color="dark" />

      <AppShell.Section
        component={Group}
        px="md"
        py="xs"
        gap="xs"
        style={{ opacity: 0.5, color: "white" }}
      >
        <MagnifyingGlassIcon
          weight="bold"
          size={16}
          style={{ color: "white" }}
        />
        <Text size="xs" hidden={collapsed} c="white">
          Search Modules.
        </Text>
      </AppShell.Section>

      <Divider color="dark" />

      <AppShell.Section
        grow
        component={Stack}
        p={0}
        gap={0}
        style={{ overflowY: "auto" }}
      >
        <Text p="md" size="xl" fw={300} lh="120%">
          {greeting}
        </Text>

        <Group px="md" gap={3}>
          {actionButtons.length > 0 ? (
            <>
              {actionButtons.map((btn, idx) => {
                const Icon = btn.icon;
                return (
                  <Button
                    key={idx}
                    rightSection={Icon ? <Icon /> : undefined}
                    size="xs"
                    color={btn.color || "indigo"}
                    onClick={btn.onClick}
                  >
                    <Text size="10px">
                      {btn.badgeCount && `${btn.badgeCount} `}
                      {btn.label}
                    </Text>
                  </Button>
                );
              })}
            </>
          ) : (
            <>
              <Button rightSection={<ArrowUpRightIcon />} size="xs" color="indigo">
                <Text size="10px">12 TODO's</Text>
              </Button>

              <Group gap={3}>
                <Indicator
                  inline
                  size={6}
                  offset={4}
                  position="top-end"
                  color="red"
                >
                  <ActionIcon color="blue" variant="light">
                    <BellIcon />
                  </ActionIcon>
                </Indicator>

                <Indicator
                  inline
                  size={6}
                  offset={4}
                  position="top-end"
                  color="red"
                >
                  <ActionIcon color="pink" variant="light">
                    <SpeakerLowIcon />
                  </ActionIcon>
                </Indicator>
              </Group>
            </>
          )}
        </Group>

        {nav.map((group) => (
          <Stack key={group.label} gap={0} mb={4}>
            {!collapsed && (
              <Text
                my="xs"
                size="8px"
                fw={800}
                tt="uppercase"
                c="gray.4"
                px="md"
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
                      ? "var(--mantine-color-gray-9)"
                      : "transparent",
                    borderLeft: isActive
                      ? "2px solid var(--mantine-color-brand-7)"
                      : "2px solid transparent",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: isActive
                      ? "var(--mantine-color-gray-0)"
                      : "var(--mantine-color-gray-6)",
                  }}
                >
                  {Icon && (
                    <Icon
                      size={12}
                      weight={"duotone"}
                      aria-hidden
                      style={{ flexShrink: 0 }}
                    />
                  )}
                  {!collapsed && (
                    <Group justify="space-between" style={{ flex: 1 }}>
                      <Text size="xs" fw={400} style={{ color: "inherit" }}>
                        {item.label}
                      </Text>
                      {item.badge && (
                        <Badge size="xs" color="blue.4">
                          {item.badge}
                        </Badge>
                      )}
                    </Group>
                  )}
                </UnstyledButton>
              );
            })}
          </Stack>
        ))}
      </AppShell.Section>

      <AppShell.Section component={Group} p="sm" justify="center">
        <UserInfoPopover />
      </AppShell.Section>
    </AppShell.Navbar>
  );
}
