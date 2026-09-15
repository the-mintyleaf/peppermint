"use client";

import {
  AppShell,
  Box,
  Burger,
  MantineProvider,
  useDisclosure,
} from "@peppermint/ui";
import type { ReactNode } from "react";
import type { Icon } from "@phosphor-icons/react";
import { useEffect, useMemo } from "react";
import { AdminShellNavbar } from "./components/Navbar/AdminShell.Navbar";
import { resolveActiveMainNavItem } from "./nav.utils";
import { SHELL_INSET, getNavbarWidth } from "./shell.constants";
import type { AdminShellConfig } from "./AdminShell.types";
import { useSubNavStore } from "@peppermint/ui";
import styles from "./AdminShell.module.css";

//@ts-ignore
import "mantine-datatable/styles.css";

// Static AppShell lays out Main via grid-template-columns (not padding). Register
// the navbar width variable as animatable so the grid column can transition.
const SUB_NAV_TRANSITION_MS = 220;

const TRANSITION_STYLES = `
  @property --app-shell-navbar-width {
    syntax: '<length>';
    inherits: true;
    initial-value: 0px;
  }
  .${styles.adminShell}[data-mode='static'] {
    transition: grid-template-columns ${SUB_NAV_TRANSITION_MS}ms ease !important;
  }
`;

interface AdminShellProps {
  children: ReactNode;
  config: AdminShellConfig;
  mainNavHeader: Icon;
  pathname?: string;
}

export function AdminShell({
  children,
  config,
  mainNavHeader,
  pathname,
}: AdminShellProps) {
  const [opened, { toggle: toggleMobileNav, close: closeMobileNav }] =
    useDisclosure();
  const subNavCollapsed = useSubNavStore((s) => s.subNavCollapsed);
  const collapse = useSubNavStore((s) => s.collapse);
  const expand = useSubNavStore((s) => s.expand);

  // Close the mobile navbar whenever the route changes so a tap-through doesn't
  // leave the overlay open on top of the new page.
  useEffect(() => {
    closeMobileNav();
  }, [pathname, closeMobileNav]);

  const activeItem = useMemo(
    () => resolveActiveMainNavItem(config.mainNav, pathname ?? ""),
    [config.mainNav, pathname],
  );

  const showSubNav = activeItem?.kind === "module" && !subNavCollapsed;

  const navbarWidth = getNavbarWidth(showSubNav);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: TRANSITION_STYLES }} />
      {/* Mobile-only toggle — the navbar is collapsed below `sm` and otherwise
          has no way to open. Sits in a dark chip so it stays visible over the
          light main content. */}
      <Box
        hiddenFrom="sm"
        pos="fixed"
        top={12}
        left={12}
        p={4}
        bg="dark.9"
        style={{ zIndex: 1000, borderRadius: "var(--mantine-radius-sm)" }}
      >
        <Burger
          opened={opened}
          onClick={toggleMobileNav}
          size="sm"
          color="var(--mantine-color-gray-0)"
          aria-label="Toggle navigation"
        />
      </Box>
      <AppShell
        className={styles.adminShell}
        mode="static"
        h="100dvh"
        p={0}
        padding={0}
        withBorder={false}
        // bg="linear-gradient(160deg, var(--mantine-color-dark-9) 0%, var(--mantine-color-brand-9) 100%)"
        transitionDuration={SUB_NAV_TRANSITION_MS}
        navbar={{
          width: navbarWidth,
          breakpoint: "sm",
          collapsed: { mobile: !opened },
        }}
      >
        <AdminShellNavbar
          config={config}
          mainNavHeader={mainNavHeader}
          pathname={pathname}
          subNavCollapsed={subNavCollapsed}
          onSubNavCollapse={collapse}
          onSubNavExpand={expand}
        />
        <AppShell.Main
          bg="transparent"
          style={{ minHeight: 0, overflow: "hidden", display: "flex" }}
        >
          <MantineProvider forceColorScheme="light">
            <Box
              flex={1}
              bg="transparent"
              style={{ minHeight: 0, minWidth: 0, overflow: "auto" }}
            >
              {children}
            </Box>
          </MantineProvider>
        </AppShell.Main>
      </AppShell>
    </>
  );
}
