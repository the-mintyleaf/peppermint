"use client";

import { AppShell, Box, useDisclosure } from "@zetsel/ui";
import { useMemo } from "react";
import { AdminShellNavbar } from "./components/Navbar/AdminShell.Navbar";
import { resolveActiveMainNavItem } from "./nav.utils";
import { SHELL_INSET, getNavbarWidth } from "./shell.constants";
import type { AdminShellConfig } from "./AdminShell.types";

//@ts-ignore
import "mantine-datatable/styles.css";

interface AdminShellProps {
  children: React.ReactNode;
  config: AdminShellConfig;
  pathname?: string;
}

export function AdminShell({
  children,
  config,
  pathname,
}: AdminShellProps) {
  const [opened] = useDisclosure();
  const [subNavCollapsed, subNavActions] = useDisclosure();

  const activeItem = useMemo(
    () => resolveActiveMainNavItem(config.mainNav, pathname ?? ""),
    [config.mainNav, pathname]
  );

  const showSubNav =
    activeItem?.kind === "module" && !subNavCollapsed;

  const navbarWidth = getNavbarWidth(showSubNav);

  return (
    <AppShell
      mode="static"
      h="100dvh"
      p={0}
      padding={0}
      withBorder={false}
      bg="black"
      navbar={{
        width: navbarWidth,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
    >
      <AdminShellNavbar
        config={config}
        pathname={pathname}
        subNavCollapsed={subNavCollapsed}
        onSubNavCollapse={subNavActions.open}
        onSubNavExpand={subNavActions.close}
      />
      <AppShell.Main
        bg="transparent"
        style={{ minHeight: 0, overflow: "hidden", display: "flex" }}
      >
        <Box
          flex={1}
          p={SHELL_INSET}
          bg="black"
          style={{ minHeight: 0, minWidth: 0, overflow: "auto" }}
        >
          {children}
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
