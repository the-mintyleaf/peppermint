"use client";

import {
  ActionIcon,
  Box,
  Divider,
  Stack,
  Tooltip,
  spotlight,
} from "@peppermint/ui";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";

import { resolveActiveNavItem } from "../../nav.utils";
import {
  NAV_HEADER_HEIGHT,
  RAIL_WIDTH,
  railCardStyle,
} from "../../shell.constants";
import {
  NavIconButton,
  NavSpotlight,
  SidebarBrand,
  SidebarFooter,
} from "./components";
import type { SidebarProps } from "./Sidebar.types";
import classes from "./Sidebar.module.css";

/** The single dark icon rail — brand, search, destinations, and footer cluster. */
export function Sidebar({ config, pathname }: SidebarProps) {
  const activeItem = resolveActiveNavItem(config.nav, pathname);

  return (
    <Stack
      gap={0}
      align="center"
      justify="space-between"
      h="100%"
      w={RAIL_WIDTH}
      style={{ flexShrink: 0, ...railCardStyle }}
    >
      <Stack gap={0} align="center" w="100%">
        <Stack h={NAV_HEADER_HEIGHT} align="center" justify="center" w="100%">
          <SidebarBrand
            icon={config.brand.icon}
            label={config.brand.label}
            href={config.brand.href}
            linkComponent={config.linkComponent}
          />
        </Stack>

        <Divider className={classes.divider} />

        <Box py={8}>
          <Tooltip label="Search" position="right" withArrow>
            <ActionIcon
              variant="subtle"
              size="lg"
              color="gray.0"
              aria-label="Search"
              onClick={() => spotlight.open()}
            >
              <MagnifyingGlassIcon size={16} weight="bold" />
            </ActionIcon>
          </Tooltip>
        </Box>

        <Divider className={classes.divider} />

        <Stack gap={4} align="center" py="sm" w="100%">
          {config.nav.map((item) => (
            <NavIconButton
              key={item.id}
              icon={item.icon}
              label={item.label}
              href={item.href}
              badge={item.badge}
              active={activeItem?.id === item.id}
              linkComponent={config.linkComponent}
            />
          ))}
        </Stack>

        {config.additional && config.additional.length > 0 && (
          <>
            <Divider className={classes.divider} />
            <Stack gap={4} align="center" py="sm" w="100%">
              {config.additional.map((item) => (
                <NavIconButton
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  href={item.onClick ? undefined : item.href}
                  badge={item.badge}
                  active={item.href ? activeItem?.href === item.href : false}
                  linkComponent={config.linkComponent}
                  onClick={
                    item.onClick
                      ? (event) => {
                          event.preventDefault();
                          item.onClick?.();
                        }
                      : undefined
                  }
                />
              ))}
            </Stack>
          </>
        )}
      </Stack>

      <SidebarFooter
        aiButton={config.aiButton}
        settingsButton={config.settingsButton}
        notifications={config.notifications}
        user={config.user}
        pathname={pathname}
        linkComponent={config.linkComponent}
        onNavigate={config.onNavigate}
      />

      <NavSpotlight
        nav={config.nav}
        additional={config.additional}
        onNavigate={config.onNavigate}
      />
    </Stack>
  );
}
