"use client";

import type { ElementType } from "react";
import {
  ActionIcon,
  BookmarksMenu,
  Box,
  Indicator,
  Tooltip,
} from "@peppermint/ui";
import type { Icon } from "@phosphor-icons/react";
import { StarFourIcon } from "@phosphor-icons/react/dist/csr/StarFour";
import { BellIcon } from "@phosphor-icons/react/dist/csr/Bell";
import { GearSixIcon } from "@phosphor-icons/react/dist/csr/GearSix";

import { CrossMark } from "@/components";
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
  /** Render in the brand colour, and opt out of the cluster's dimmed-ink rule. */
  accent?: boolean;
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
  accent = false,
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
        size="md"
        color={accent ? "var(--mantine-primary-color-filled)" : "gray"}
        data-accent={accent || undefined}
        aria-label={label}
        aria-current={active ? "page" : undefined}
      >
        <IconComponent
          size={16}
          weight={weight ?? (active ? "fill" : "regular")}
        />
      </ActionIcon>
    </Tooltip>
  );
}

/**
 * Bottom region of the nav column: a row of app-level quick actions (AI,
 * bookmarks, notifications, settings) over the account row, divided by a dotted
 * rule — same region, subdivided — with a junction mark at each end of it.
 */
export function SidebarFooter({
  aiButton,
  settingsButton,
  notifications,
  user,
  pathname,
  linkComponent,
  onNavigate,
  collapsed = false,
  framed = true,
}: SidebarFooterProps) {
  const settingsHref = settingsButton?.href ?? "/settings";
  const settingsActive = isActiveHref(pathname, settingsHref);
  const hasUnread = (notifications?.count ?? 0) > 0;

  return (
    <>
      <Box className={collapsed ? classes.actionsCollapsed : classes.actions}>
        {framed && <CrossMark size="sm" className={classes.junctionStart} />}
        <CrossMark size="sm" className={classes.junctionEnd} />

        {aiButton && !aiButton.hidden && (
          <QuickAction
            icon={aiButton.icon ?? StarFourIcon}
            label={aiButton.label ?? "Ask AI"}
            href={aiButton.href}
            onClick={aiButton.onClick}
            accent
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

        {!collapsed && <Box className={classes.spacer} />}

        {settingsButton && !settingsButton.hidden && (
          <QuickAction
            icon={settingsButton.icon ?? GearSixIcon}
            label={settingsButton.label ?? "Settings"}
            href={settingsHref}
            onClick={settingsButton.onClick}
            active={settingsActive}
            accent={settingsActive}
            linkComponent={linkComponent}
          />
        )}
      </Box>

      {user && (
        <UserMenu
          user={user}
          linkComponent={linkComponent}
          onNavigate={onNavigate}
          collapsed={collapsed}
        />
      )}
    </>
  );
}
