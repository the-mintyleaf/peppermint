"use client";

import type { ElementType } from "react";
import {
  ActionIcon,
  BookmarksMenu,
  Box,
  Divider,
  Indicator,
  Stack,
  Tooltip,
} from "@peppermint/ui";
import type { Icon } from "@phosphor-icons/react";
import { StarFourIcon } from "@phosphor-icons/react/dist/csr/StarFour";
import { BellIcon } from "@phosphor-icons/react/dist/csr/Bell";
import { GearSixIcon } from "@phosphor-icons/react/dist/csr/GearSix";

import { UserMenu } from "../UserMenu";
import { isActiveHref } from "../../../../nav.utils";
import type { SidebarFooterProps } from "./SidebarFooter.types";
import classes from "./SidebarFooter.module.css";

interface QuickActionProps {
  icon: Icon;
  label: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  color?: string;
  weight?: "fill" | "regular";
  linkComponent?: ElementType;
}

/**
 * A single footer quick action. Links render through `linkComponent` (Next
 * `Link`) so modified-clicks keep their native semantics; only genuine
 * button actions attach an `onClick`.
 */
function QuickAction({
  icon: IconComponent,
  label,
  href,
  onClick,
  active = false,
  color = "gray.0",
  weight,
  linkComponent,
}: QuickActionProps) {
  const useButton = Boolean(onClick);
  // Cast narrows Mantine's polymorphic `component` from the broad `ElementType`.
  const Component = (useButton ? "button" : (linkComponent ?? "a")) as "a";

  return (
    <Tooltip label={label} withArrow>
      <ActionIcon
        component={Component}
        href={useButton ? undefined : href}
        onClick={useButton ? onClick : undefined}
        variant="subtle"
        size="lg"
        color={color}
        aria-label={label}
        aria-current={active ? "page" : undefined}
      >
        <IconComponent
          size={18}
          weight={weight ?? (active ? "fill" : "regular")}
        />
      </ActionIcon>
    </Tooltip>
  );
}

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

  return (
    <Stack gap={8}>
      <Divider className={classes.divider} />

      <Box className={classes.cluster}>
        {aiButton && !aiButton.hidden && (
          <QuickAction
            icon={aiButton.icon ?? StarFourIcon}
            label={aiButton.label ?? "Ask AI"}
            href={aiButton.href}
            onClick={aiButton.onClick}
            color="accent.4"
            weight="fill"
            linkComponent={linkComponent}
          />
        )}

        <BookmarksMenu variant="sidenav" onNavigate={onNavigate} />

        {notifications && !notifications.hidden && (
          <Indicator
            inline
            size={7}
            offset={6}
            position="top-end"
            color="red"
            disabled={!hasUnread}
          >
            <QuickAction
              icon={BellIcon}
              label="Notifications"
              href={notifications.href}
              onClick={notifications.onClick}
              weight="fill"
              linkComponent={linkComponent}
            />
          </Indicator>
        )}

        <Box className={classes.spacer} />

        {settingsButton && !settingsButton.hidden && (
          <QuickAction
            icon={settingsButton.icon ?? GearSixIcon}
            label={settingsButton.label ?? "Settings"}
            href={settingsHref}
            onClick={settingsButton.onClick}
            active={settingsActive}
            color={settingsActive ? "accent.4" : "gray.0"}
            linkComponent={linkComponent}
          />
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
