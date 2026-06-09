"use client";

import type { ReactNode } from "react";
import { AppShell, Group } from "@zetsel/ui";
import { MainNav } from "./MainNav/MainNav";
import { SubNav } from "./SubNav/SubNav";
import { resolveActiveMainNavItem } from "../../nav.utils";
import { SHELL_GAP, SHELL_INSET } from "../../shell.constants";
import type { AdminShellConfig } from "../../AdminShell.types";

export { MAIN_NAV_WIDTH, SUB_NAV_WIDTH } from "../../shell.constants";

interface AdminShellNavbarProps {
  config: AdminShellConfig;
  mainNavHeader: ReactNode;
  pathname?: string;
  subNavCollapsed: boolean;
  onSubNavCollapse: () => void;
  onSubNavExpand: () => void;
}

export function AdminShellNavbar({
  config,
  mainNavHeader,
  pathname = "",
  subNavCollapsed,
  onSubNavCollapse,
  onSubNavExpand,
}: AdminShellNavbarProps) {
  const activeItem = resolveActiveMainNavItem(config.mainNav, pathname);
  const showSubNav =
    activeItem?.kind === "module" && !subNavCollapsed;

  return (
    <AppShell.Navbar
      p={SHELL_INSET}
      pl={SHELL_INSET}
      pt={SHELL_INSET}
      pb={SHELL_INSET}
      pr={0}
      bg="transparent"
      style={{ border: "none", color: "white", overflow: "hidden" }}
    >
      <Group
        gap={SHELL_GAP}
        align="stretch"
        h="100%"
        wrap="nowrap"
        style={{ overflow: "hidden" }}
      >
        <MainNav
          header={mainNavHeader}
          brand={config.brand}
          mainNav={config.mainNav}
          additional={config.additional}
          aiButton={config.aiButton}
          pathname={pathname}
          activeItemId={activeItem?.id}
          subNavCollapsed={subNavCollapsed}
          onSubNavExpand={onSubNavExpand}
          userMenu={config.userMenu}
        />

        {showSubNav && activeItem.kind === "module" && (
          <SubNav
            module={activeItem}
            pathname={pathname}
            onCollapse={onSubNavCollapse}
          />
        )}
      </Group>
    </AppShell.Navbar>
  );
}
