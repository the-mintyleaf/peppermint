"use client";

import { ActionIcon, Box, Divider, Stack } from "@peppermint/ui";
import { MagnifyingGlass, type Icon } from "@phosphor-icons/react";
import { MinusIcon } from "@phosphor-icons/react/dist/ssr";
import type {
  AdminShellAiButton,
  AdminShellMainNavAdditional,
  AdminShellMainNavItem,
  AdminShellSettingsButton,
} from "../../../AdminShell.types";
import {
  MAIN_NAV_WIDTH,
  NAV_HEADER_HEIGHT,
  shellCardStyle,
} from "../../../shell.constants";
import type { UserInfoPopoverProps } from "../UserInfoPopover/UserInfoPopover.types";
import { MainNavFooter } from "./MainNavFooter";
import { MainNavIconButton } from "./MainNavIconButton";
import { MainNavSpotlight } from "./MainNavSpotlight";

interface MainNavProps {
  header: Icon;
  mainNav: AdminShellMainNavItem[];
  additional?: AdminShellMainNavAdditional[];
  aiButton?: AdminShellAiButton;
  settingsButton?: AdminShellSettingsButton;
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
  settingsButton,
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
      style={{ flexShrink: 0, ...shellCardStyle }}
    >
      <Stack gap={0} align="center" w="100%">
        <Stack h={NAV_HEADER_HEIGHT} align="center" justify="center" w="100%">
          <ActionIcon
            color="brand.5"
            variant="subtle"
            size="xl"
            radius="var(--mantine-radius-default)"
          >
            <LeafIcon weight="fill" />
          </ActionIcon>
        </Stack>

        <MinusIcon
          weight="fill"
          size={6}
          style={{
            opacity: 0.5,
            margin: "4px 0",
          }}
          color="var(--mantine-color-brand-6)"
        />

        <Box py={4}>
          <ActionIcon variant="subtle">
            <MagnifyingGlass
              size={16}
              weight="bold"
              color="var(--mantine-color-gray-0)"
            />
          </ActionIcon>
        </Box>

        <MinusIcon
          weight="fill"
          size={6}
          style={{
            opacity: 0.5,
            margin: "4px 0",
          }}
          color="var(--mantine-color-brand-6)"
        />

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
        settingsButton={settingsButton}
        pathname={pathname}
        userMenu={userMenu}
        onNavigate={onNavigate}
      />

      <MainNavSpotlight
        mainNav={mainNav}
        additional={additional}
        onNavigate={onNavigate}
      />
    </Stack>
  );
}
