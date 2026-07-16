"use client";

import type { MouseEvent } from "react";
import { Avatar, Menu, Stack, Text, UnstyledButton } from "@peppermint/ui";
import { CaretUpDownIcon } from "@phosphor-icons/react/dist/csr/CaretUpDown";

import type { AppShellUserMenuItem } from "../../../../AppShell.types";
import type { UserMenuProps } from "./UserMenu.types";
import classes from "./UserMenu.module.css";

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Full-width account row (avatar + name + email) that opens a menu. Replaces the
 * admin package's internal `UserInfoPopover` with an in-app Mantine `Menu`.
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
    <Menu position="top" withArrow shadow="md" width="target">
      <Menu.Target>
        <UnstyledButton
          className={classes.trigger}
          aria-label={`Account: ${user.name}`}
        >
          <Avatar
            src={user.avatarUrl}
            size={36}
            radius="xl"
            color="accent"
            variant="filled"
          >
            {getInitials(user.name)}
          </Avatar>
          <Stack gap={0} className={classes.text}>
            <Text component="span" className={classes.name}>
              {user.name}
            </Text>
            {user.email && (
              <Text component="span" className={classes.email}>
                {user.email}
              </Text>
            )}
          </Stack>
          <CaretUpDownIcon size={14} className={classes.caret} />
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
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
