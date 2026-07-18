"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AppShell,
  Box,
  Burger,
  Button,
  Center,
  Group,
  Loader,
  Stack,
  Text,
  useDisclosure,
} from "@peppermint/ui";
import { KeyIcon } from "@phosphor-icons/react/dist/csr/Key";
import { SignOutIcon } from "@phosphor-icons/react/dist/csr/SignOut";

import { tokens } from "@/config/design";
import { AccountModal } from "@/components";
import { useCurrentUser } from "@/modules/auth/_shared/useCurrentUser";
import { useLogout } from "@/modules/auth/_shared/useLogout";
import { useRailCollapsed } from "./AppShell.hooks";
import { APP_SHELL_CONFIG } from "./nav.config";
import { Sidebar } from "./components/Sidebar";
import { NAV_WIDTH, NAV_WIDTH_COLLAPSED, SHELL_INSET } from "./shell.constants";
import type { AppShellConfig, AppShellNavGroup } from "./AppShell.types";
import classes from "./AppShell.module.css";

/**
 * Hide any nav group/row flagged `requiresStaff` from non-staff accounts, then
 * drop groups left with no visible rows. This is the client-side half of the
 * "permission-based access on modules" gate — the backend remains authoritative.
 */
function filterNavByRole(
  groups: AppShellNavGroup[],
  isStaff: boolean,
): AppShellNavGroup[] {
  return groups
    .filter((group) => !group.requiresStaff || isStaff)
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.requiresStaff || isStaff),
    }))
    .filter((group) => group.items.length > 0);
}

/**
 * mintflow chrome — a single always-open 280px navigation panel (no icon-rail /
 * sub-nav split) over the warm-paper content area. Gates the whole authenticated
 * area: no session bounces to sign-in, a forced password change bounces to
 * `/password-change`, and the nav is filtered by the account role. Runtime
 * `onNavigate` / `linkComponent` are injected here.
 */
export function LayoutAppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [opened, { toggle: toggleMobileNav, close: closeMobileNav }] =
    useDisclosure();
  const [accountOpened, accountHandlers] = useDisclosure();

  const { user, isStaff, isLoading, isError, refetch } = useCurrentUser();
  const { mutate: logoutMutate } = useLogout();

  // No session → back to sign-in. The api-client also redirects on a failed
  // refresh; this is the fast path before the first `/me` request even fires.
  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      router.replace("/");
    }
  }, [router]);

  // A forced first-login / post-reset password change must happen before the app.
  useEffect(() => {
    if (user?.password_change_required) {
      router.replace("/password-change");
    }
  }, [user, router]);

  // Desktop-only; below `sm` the panel is the Burger overlay and stays full-width.
  const isCollapsed = useRailCollapsed();
  const navbarWidth =
    (isCollapsed ? NAV_WIDTH_COLLAPSED : NAV_WIDTH) + SHELL_INSET * 2;

  // Close the mobile navbar on route change so a tap-through doesn't leave the
  // overlay open on top of the new page.
  useEffect(() => {
    closeMobileNav();
  }, [pathname, closeMobileNav]);

  const config = useMemo<AppShellConfig>(
    () => ({
      ...APP_SHELL_CONFIG,
      groups: filterNavByRole(APP_SHELL_CONFIG.groups, isStaff),
      linkComponent: Link,
      onNavigate: (href) => router.push(href),
      user: user
        ? {
            name: user.display_name || user.username,
            email: user.email ?? undefined,
            menuItems: [
              {
                id: "change-password",
                label: "Change password",
                icon: KeyIcon,
                onClick: accountHandlers.open,
              },
              {
                id: "signout",
                label: "Sign out",
                icon: SignOutIcon,
                danger: true,
                onClick: () => logoutMutate(),
              },
            ],
          }
        : undefined,
    }),
    [isStaff, user, router, accountHandlers.open, logoutMutate],
  );

  // A non-401 `/me` failure (500, timeout, CORS) never self-redirects — the
  // api-client only clears the session on a 401 — so a valid-token user would
  // otherwise hang on the loader forever. Surface a recovery path instead. A
  // token-less viewer is already being redirected (effect + api-client), so keep
  // the loader for that case rather than flashing an error card.
  if (isError && typeof window !== "undefined") {
    const hasToken = Boolean(localStorage.getItem("access_token"));
    if (hasToken) {
      return (
        <Center h="100dvh" bg="dark.9" p="md">
          <Stack align="center" gap="sm" maw={340}>
            <Text c="gray.0" fw={600}>
              Couldn&apos;t verify your session
            </Text>
            <Text c="gray.5" size="sm" ta="center">
              Something went wrong while loading your account. Try again, or
              sign out and sign back in.
            </Text>
            <Group gap="sm" mt="xs">
              <Button variant="light" color="brand" onClick={() => refetch()}>
                Retry
              </Button>
              <Button
                variant="subtle"
                color="gray"
                onClick={() => logoutMutate()}
              >
                Sign out
              </Button>
            </Group>
          </Stack>
        </Center>
      );
    }
  }

  // Hold the shell until identity resolves: loading, the "no user / redirect"
  // window, and the forced-password-change bounce all render a loader instead of
  // flashing the app chrome to an unauthenticated viewer.
  if (isLoading || !user || user.password_change_required) {
    return (
      <Center h="100dvh" bg="dark.9">
        <Loader size="sm" color="brand.5" />
      </Center>
    );
  }

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
        bg="dark.9"
        mode="static"
        h="100dvh"
        p={0}
        padding={0}
        withBorder={false}
        navbar={{
          width: navbarWidth,
          breakpoint: "sm",
          collapsed: { mobile: !opened },
        }}
      >
        <AppShell.Navbar
          p={SHELL_INSET}
          bg="transparent"
          className={classes.navbar}
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
            }}
          >
            {children}
          </Box>
        </AppShell.Main>
      </AppShell>

      <AccountModal opened={accountOpened} onClose={accountHandlers.close} />
    </>
  );
}
