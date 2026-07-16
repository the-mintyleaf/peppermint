"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AppShell, Box, Burger, useDisclosure } from "@peppermint/ui";

import { tokens } from "@/config/design";
import { APP_SHELL_CONFIG } from "./nav.config";
import { Sidebar } from "./components/Sidebar";
import { NAV_WIDTH, SHELL_INSET } from "./shell.constants";
import type { AppShellConfig } from "./AppShell.types";

const NAVBAR_WIDTH = NAV_WIDTH + SHELL_INSET * 2;

/**
 * mintflow-admin chrome — a single always-open 280px navigation panel (no
 * icon-rail / sub-nav split) over the warm-paper content area. Config is the
 * placeholder in `nav.config.tsx`; router-bound `onNavigate` / `linkComponent`
 * are injected here.
 */
export function LayoutAppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [opened, { toggle: toggleMobileNav, close: closeMobileNav }] =
    useDisclosure();

  // Close the mobile navbar on route change so a tap-through doesn't leave the
  // overlay open on top of the new page.
  useEffect(() => {
    closeMobileNav();
  }, [pathname, closeMobileNav]);

  const config = useMemo<AppShellConfig>(
    () => ({
      ...APP_SHELL_CONFIG,
      linkComponent: Link,
      onNavigate: (href) => router.push(href),
    }),
    [router],
  );

  return (
    <>
      {/* Mobile-only toggle — the panel collapses below `sm` and otherwise has
          no way to open. Dark chip keeps it visible over the light content. */}
      <Box
        hiddenFrom="sm"
        pos="fixed"
        top={12}
        left={12}
        p={4}
        bg={tokens.tile}
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
        mode="static"
        h="100dvh"
        p={0}
        padding={0}
        withBorder={false}
        navbar={{
          width: NAVBAR_WIDTH,
          breakpoint: "sm",
          collapsed: { mobile: !opened },
        }}
      >
        <AppShell.Navbar
          p={SHELL_INSET}
          bg="transparent"
          style={{ border: "none", overflow: "hidden" }}
        >
          <Sidebar config={config} pathname={pathname} />
        </AppShell.Navbar>

        <AppShell.Main
          bg="transparent"
          style={{ minHeight: 0, overflow: "hidden", display: "flex" }}
        >
          <Box
            flex={1}
            // Reserve top space on mobile so content clears the fixed burger.
            pt={{ base: 52, sm: 0 }}
            style={{
              minHeight: 0,
              minWidth: 0,
              overflow: "auto",
              background: tokens.paper,
            }}
          >
            {children}
          </Box>
        </AppShell.Main>
      </AppShell>
    </>
  );
}
