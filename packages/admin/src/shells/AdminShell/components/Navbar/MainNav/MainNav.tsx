"use client";

import type { ReactNode } from "react";
import { Divider, Stack } from "@zetsel/ui";
import { MainNavIconButton } from "./MainNavIconButton";
import { MainNavFooter } from "./MainNavFooter";
import type {
  AdminShellAiButton,
  AdminShellBrand,
  AdminShellMainNavAdditional,
  AdminShellMainNavItem,
} from "../../../AdminShell.types";
import type { UserInfoPopoverProps } from "../UserInfoPopover/UserInfoPopover.types";
import {
  MAIN_NAV_WIDTH,
  NAV_HEADER_HEIGHT,
  shellCardStyle,
} from "../../../shell.constants";

interface MainNavProps {
  header: ReactNode;
  brand: AdminShellBrand;
  mainNav: AdminShellMainNavItem[];
  additional?: AdminShellMainNavAdditional[];
  aiButton?: AdminShellAiButton;
  pathname?: string;
  activeItemId?: string;
  subNavCollapsed?: boolean;
  onSubNavExpand?: () => void;
  userMenu?: UserInfoPopoverProps;
}

export function MainNav({
  header,
  brand,
  mainNav,
  additional,
  aiButton,
  pathname,
  activeItemId,
  subNavCollapsed = false,
  onSubNavExpand,
  userMenu,
}: MainNavProps) {
  return (
    <Stack
      gap={0}
      align="center"
      justify="space-between"
      h="100%"
      w={MAIN_NAV_WIDTH}
      bg="dark.9"
      style={{ flexShrink: 0, ...shellCardStyle }}
    >
      <Stack gap={0} align="center" w="100%">
        <Stack
          h={NAV_HEADER_HEIGHT}
          align="center"
          justify="center"
          w="100%"
        >
          {header}
        </Stack>

        <Divider color="dark.7" w="60%" />

        <Stack gap={4} align="center" py="sm" w="100%">
          {mainNav.map((item:any) => {
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
        brandIcon={brand.icon}
        aiButton={aiButton}
        pathname={pathname}
        userMenu={userMenu}
      />
    </Stack>
  );
}
