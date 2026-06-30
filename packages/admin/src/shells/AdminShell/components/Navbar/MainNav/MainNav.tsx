"use client";

import { ActionIcon, BookmarksMenu, Box, Divider, Stack } from "@peppermint/ui";
import { MainNavIconButton } from "./MainNavIconButton";
import { MainNavFooter } from "./MainNavFooter";
import type {
  AdminShellAiButton,
  AdminShellMainNavAdditional,
  AdminShellMainNavItem,
} from "../../../AdminShell.types";
import type { UserInfoPopoverProps } from "../UserInfoPopover/UserInfoPopover.types";
import {
  MAIN_NAV_WIDTH,
  NAV_HEADER_HEIGHT,
  shellCardStyle,
} from "../../../shell.constants";
import { spotlight } from "@peppermint/ui";
import { MagnifyingGlass, type Icon } from "@phosphor-icons/react";
import { MainNavSpotlight } from "./MainNavSpotlight";

interface MainNavProps {
  header: Icon;
  mainNav: AdminShellMainNavItem[];
  additional?: AdminShellMainNavAdditional[];
  aiButton?: AdminShellAiButton;
  pathname?: string;
  activeItemId?: string;
  subNavCollapsed?: boolean;
  onSubNavExpand?: () => void;
  onNavigate?: (href: string) => void;
  userMenu?: UserInfoPopoverProps;
}

export function MainNav({
  header: LeafIcon,
  mainNav,
  additional,
  aiButton,
  pathname,
  activeItemId,
  subNavCollapsed = false,
  onSubNavExpand,
  onNavigate,
  userMenu,
}: MainNavProps) {
  return (
    <Stack
      gap={0}
      align="center"
      justify="space-between"
      h="100%"
      w={MAIN_NAV_WIDTH}
      bg="dark.8"
      style={{ flexShrink: 0, ...shellCardStyle }}
    >
      <Stack gap={0} align="center" w="100%">
        <Stack h={NAV_HEADER_HEIGHT} align="center" justify="center" w="100%">
          <ActionIcon size="lg" radius="var(--mantine-radius-default)" w={MAIN_NAV_WIDTH - 16}>
            <LeafIcon weight="fill" />
          </ActionIcon>
        </Stack>

        <Divider color="dark.7" w="60%" />

        <Box py={4}>
          <MainNavIconButton
            icon={MagnifyingGlass}
            label="Search modules"
            onClick={() => spotlight.open()}
          />
        </Box>

        <Box py={4}>
          <BookmarksMenu variant="sidenav" onNavigate={onNavigate} />
        </Box>

        <Divider color="dark.7" w="60%" />

        <Stack gap={4} align="center" py="sm" w="100%">
          {mainNav.map((item) => {
            const href =
              item.kind === "page" ? item.href : item.subNav.homeHref;
            const isActive = activeItemId === item.id;

            return (
              <MainNavIconButton
                key={item.id}
                icon={item.icon}
                label={item.label}
                href={href}
                active={isActive}
                onClick={(event) => {
                  if (
                    isActive &&
                    item.kind === "module" &&
                    subNavCollapsed &&
                    onSubNavExpand
                  ) {
                    event.preventDefault();
                    onSubNavExpand();
                  }
                }}
              />
            );
          })}
        </Stack>

        {additional && additional.length > 0 && (
          <>
            <Divider color="dark.7" w="60%" />
            <Stack gap={4} align="center" py="sm" w="100%">
              {additional.map((item) => (
                <MainNavIconButton
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  onClick={item.onClick}
                />
              ))}
            </Stack>
          </>
        )}
      </Stack>

      <MainNavFooter
        aiButton={aiButton}
        pathname={pathname}
        userMenu={userMenu}
      />

      <MainNavSpotlight
        mainNav={mainNav}
        additional={additional}
        onNavigate={onNavigate}
      />
    </Stack>
  );
}
