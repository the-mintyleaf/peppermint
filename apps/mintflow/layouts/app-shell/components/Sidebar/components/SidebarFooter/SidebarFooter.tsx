"use client";

import type { MouseEvent } from "react";
import {
  ActionIcon,
  BookmarksMenu,
  Box,
  Divider,
  Indicator,
  Stack,
  Tooltip,
} from "@peppermint/ui";
import { StarFourIcon } from "@phosphor-icons/react/dist/csr/StarFour";
import { BellIcon } from "@phosphor-icons/react/dist/csr/Bell";
import { GearSixIcon } from "@phosphor-icons/react/dist/csr/GearSix";

import { UserMenu } from "../UserMenu";
import { isActiveHref } from "../../../../nav.utils";
import type { SidebarFooterProps } from "./SidebarFooter.types";
import classes from "./SidebarFooter.module.css";

/**
 * Bottom cluster of the nav panel: a row of quick actions (AI, bookmarks,
 * notifications, settings) above the full-width account row.
 */
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
  const settingsActive = isActiveHref(pathname, settingsHref);
  const hasUnread = (notifications?.count ?? 0) > 0;

  const navigate = (event: MouseEvent, onClick?: () => void, href?: string) => {
    if (onClick) {
      event.preventDefault();
      onClick();
    } else if (href && onNavigate) {
      event.preventDefault();
      onNavigate(href);
    }
  };

  const AiIcon = aiButton?.icon ?? StarFourIcon;
  const SettingsIcon = settingsButton?.icon ?? GearSixIcon;

  return (
    <Stack gap={8}>
      <Divider className={classes.divider} />

      <Box className={classes.cluster}>
        {aiButton && !aiButton.hidden && (
          <Tooltip label={aiButton.label ?? "Ask AI"} withArrow>
            <ActionIcon
              component={aiButton.onClick ? "button" : "a"}
              href={aiButton.onClick ? undefined : aiButton.href}
              variant="subtle"
              size="lg"
              color="accent.4"
              aria-label={aiButton.label ?? "Ask AI"}
              onClick={(event: MouseEvent) =>
                navigate(event, aiButton.onClick, aiButton.href)
              }
            >
              <AiIcon size={18} weight="fill" />
            </ActionIcon>
          </Tooltip>
        )}

        <BookmarksMenu variant="sidenav" onNavigate={onNavigate} />

        {notifications && !notifications.hidden && (
          <Tooltip label="Notifications" withArrow>
            <Indicator
              inline
              size={7}
              offset={6}
              position="top-end"
              color="red"
              disabled={!hasUnread}
            >
              <ActionIcon
                component={notifications.onClick ? "button" : "a"}
                href={notifications.onClick ? undefined : notifications.href}
                variant="subtle"
                size="lg"
                color="gray.0"
                aria-label="Notifications"
                onClick={(event: MouseEvent) =>
                  navigate(event, notifications.onClick, notifications.href)
                }
              >
                <BellIcon size={18} weight="fill" />
              </ActionIcon>
            </Indicator>
          </Tooltip>
        )}

        <Box className={classes.spacer} />

        {settingsButton && !settingsButton.hidden && (
          <Tooltip label={settingsButton.label ?? "Settings"} withArrow>
            <ActionIcon
              component={settingsButton.onClick ? "button" : "a"}
              href={settingsButton.onClick ? undefined : settingsHref}
              variant="subtle"
              size="lg"
              color={settingsActive ? "accent.4" : "gray.0"}
              aria-label={settingsButton.label ?? "Settings"}
              aria-current={settingsActive ? "page" : undefined}
              onClick={(event: MouseEvent) =>
                navigate(event, settingsButton.onClick, settingsHref)
              }
            >
              <SettingsIcon
                size={18}
                weight={settingsActive ? "fill" : "regular"}
              />
            </ActionIcon>
          </Tooltip>
        )}
      </Box>

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
