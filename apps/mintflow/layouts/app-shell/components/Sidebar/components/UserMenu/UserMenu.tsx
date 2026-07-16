"use client";

import type { MouseEvent } from "react";
import {
  Avatar,
  Menu,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
} from "@peppermint/ui";

import type { AppShellUserMenuItem } from "../../../../AppShell.types";
import type { UserMenuProps } from "./UserMenu.types";

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Avatar trigger + dropdown for the signed-in user. Replaces the admin package's
 * internal `UserInfoPopover` with an in-app Mantine `Menu`.
 */
export function UserMenu({ user, linkComponent, onNavigate }: UserMenuProps) {
  const handleItemClick =
    (item: AppShellUserMenuItem) => (event: MouseEvent) => {
      if (item.onClick) {
        event.preventDefault();
        item.onClick();
        return;
      }

      if (item.href && onNavigate) {
        event.preventDefault();
        onNavigate(item.href);
      }
    };

  return (
    <Menu position="right-end" withArrow shadow="md" width={200}>
      <Menu.Target>
        <Tooltip label={user.name} position="right" withArrow>
          <UnstyledButton aria-label={`Account: ${user.name}`}>
            <Avatar
              src={user.avatarUrl}
              size={34}
              radius="xl"
              color="accent"
              variant="filled"
            >
              {getInitials(user.name)}
            </Avatar>
          </UnstyledButton>
        </Tooltip>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>
          <Stack gap={0}>
            <Text size="sm" fw={600} c="var(--mantine-color-text)">
              {user.name}
            </Text>
            {user.email && (
              <Text size="xs" c="dimmed">
                {user.email}
              </Text>
            )}
          </Stack>
        </Menu.Label>

        <Menu.Divider />

        {user.menuItems?.map((item) => {
          const Icon = item.icon;
          const asLink = Boolean(item.href && !item.onClick);
          // Cast narrows Mantine's polymorphic `component` from `ElementType`.
          const Component = (asLink ? (linkComponent ?? "a") : "button") as "a";
          return (
            <Menu.Item
              key={item.id}
              component={Component}
              href={asLink ? item.href : undefined}
              onClick={handleItemClick(item)}
              color={item.danger ? "red" : undefined}
              leftSection={Icon ? <Icon size={16} /> : undefined}
            >
              {item.label}
            </Menu.Item>
          );
        })}
      </Menu.Dropdown>
    </Menu>
  );
}
