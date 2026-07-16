"use client";

import type { MouseEvent } from "react";
import {
  ActionIcon,
  BookmarksMenu,
  Divider,
  Indicator,
  Stack,
  Tooltip,
  UnstyledButton,
} from "@peppermint/ui";
import { StarFourIcon } from "@phosphor-icons/react/dist/csr/StarFour";
import { BellIcon } from "@phosphor-icons/react/dist/csr/Bell";
import { GearSixIcon } from "@phosphor-icons/react/dist/csr/GearSix";

import { NavIconButton } from "../NavIconButton";
import { UserMenu } from "../UserMenu";
import { isActiveHref } from "../../../../nav.utils";
import type { SidebarFooterProps } from "./SidebarFooter.types";
import type {
  AppShellAiButton,
  AppShellNotifications,
} from "../../../../AppShell.types";
import classes from "./SidebarFooter.module.css";

function AiButton({
  aiButton,
  linkComponent,
  onNavigate,
}: {
  aiButton: AppShellAiButton;
  linkComponent?: SidebarFooterProps["linkComponent"];
  onNavigate?: (href: string) => void;
}) {
  const label = aiButton.label ?? "AI Assistant";
  const Icon = aiButton.icon ?? StarFourIcon;
  const useButton = Boolean(aiButton.onClick);
  // Cast narrows Mantine's polymorphic `component` from the broad `ElementType`.
  const Component = (useButton ? "button" : (linkComponent ?? "a")) as "a";

  return (
    <Tooltip label={label} position="right" withArrow>
      <UnstyledButton
        component={Component}
        href={useButton ? undefined : aiButton.href}
        aria-label={label}
        className={classes.aiButton}
        onClick={(event: MouseEvent) => {
          if (aiButton.onClick) {
            event.preventDefault();
            aiButton.onClick();
          } else if (aiButton.href && onNavigate) {
            event.preventDefault();
            onNavigate(aiButton.href);
          }
        }}
      >
        <Icon size={18} weight="fill" />
      </UnstyledButton>
    </Tooltip>
  );
}

function NotificationsBell({
  notifications,
  linkComponent,
  onNavigate,
}: {
  notifications: AppShellNotifications;
  linkComponent?: SidebarFooterProps["linkComponent"];
  onNavigate?: (href: string) => void;
}) {
  const hasUnread = (notifications.count ?? 0) > 0;
  const useButton = Boolean(notifications.onClick);
  // Cast narrows Mantine's polymorphic `component` from the broad `ElementType`.
  const Component = (useButton ? "button" : (linkComponent ?? "a")) as "a";

  return (
    <Indicator
      inline
      size={7}
      offset={5}
      position="top-end"
      color="red"
      disabled={!hasUnread}
    >
      <ActionIcon
        component={Component}
        href={useButton ? undefined : notifications.href}
        variant="subtle"
        size="lg"
        color="gray.0"
        aria-label="Notifications"
        onClick={(event: MouseEvent) => {
          if (notifications.onClick) {
            event.preventDefault();
            notifications.onClick();
          } else if (notifications.href && onNavigate) {
            event.preventDefault();
            onNavigate(notifications.href);
          }
        }}
      >
        <BellIcon size={18} weight="fill" />
      </ActionIcon>
    </Indicator>
  );
}

/** Bottom cluster of the rail: AI, bookmarks, notifications, settings, user. */
export function SidebarFooter({
  aiButton,
  settingsButton,
  notifications,
  user,
  pathname,
  linkComponent,
  onNavigate,
}: SidebarFooterProps) {
  const settingsHref = settingsButton?.href ?? "/settings";

  return (
    <Stack gap={6} align="center" py="xs">
      {aiButton && !aiButton.hidden && (
        <>
          <AiButton
            aiButton={aiButton}
            linkComponent={linkComponent}
            onNavigate={onNavigate}
          />
          <Divider className={classes.divider} />
        </>
      )}

      <BookmarksMenu variant="sidenav" onNavigate={onNavigate} />

      {notifications && !notifications.hidden && (
        <NotificationsBell
          notifications={notifications}
          linkComponent={linkComponent}
          onNavigate={onNavigate}
        />
      )}

      {settingsButton && !settingsButton.hidden && (
        <NavIconButton
          icon={settingsButton.icon ?? GearSixIcon}
          label={settingsButton.label ?? "Settings"}
          href={settingsButton.onClick ? undefined : settingsHref}
          active={isActiveHref(pathname, settingsHref)}
          linkComponent={linkComponent}
          onClick={
            settingsButton.onClick
              ? (event) => {
                  event.preventDefault();
                  settingsButton.onClick?.();
                }
              : undefined
          }
        />
      )}

      {user && (
        <UserMenu
          user={user}
          linkComponent={linkComponent}
          onNavigate={onNavigate}
        />
      )}
    </Stack>
  );
}
