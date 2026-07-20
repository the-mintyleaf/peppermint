"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Box,
  Button,
  Drawer,
  Group,
  Loader,
  Stack,
  Text,
  useDisclosure,
  useMediaQuery,
} from "@peppermint/ui";
import { KeyIcon } from "@phosphor-icons/react/dist/csr/Key";
import { SignOutIcon } from "@phosphor-icons/react/dist/csr/SignOut";

import { AccountModal, CrossMark } from "@/components";
import { useCurrentUser } from "@/modules/auth/_shared/useCurrentUser";
import { useLogout } from "@/modules/auth/_shared/useLogout";
import { useSidebarStore } from "./AppShell.store";
import { useRailCollapsed } from "./AppShell.hooks";
import { APP_SHELL_CONFIG } from "./nav.config";
import { flattenNavItems, resolveActiveHref } from "./nav.utils";
import { Sidebar } from "./components/Sidebar";
import { NavSpotlight } from "./components/NavSpotlight";
import { StatusRail } from "./components/StatusRail";
import { TopRail } from "./components/TopRail";
import {
  NAV_BREAKPOINT,
  NAV_WIDTH,
  NAV_WIDTH_COLLAPSED,
  SHELL_VERSION,
} from "./shell.constants";
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
 * mintplayground chrome, in the Modern Lines language: one frame inset from the
 * viewport, subdivided by rules into top rail → nav column + content → status
 * rail → accent bar. Every junction between two rules carries a `+`. See
 * `docs/design/design-system.md`.
 *
 * It also gates the whole authenticated area: no session bounces to sign-in, a
 * forced password change bounces to `/password-change`, and the nav is filtered
 * by the account role. Runtime `onNavigate` / `linkComponent` are injected here.
 */
export function LayoutAppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [navOpened, { toggle: toggleNav, close: closeNav }] = useDisclosure();
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

  // Collapse is a desktop concern; below `sm` the nav column is the drawer.
  const isCollapsed = useRailCollapsed();
  const hasHydrated = useSidebarStore((s) => s.hasHydrated);
  const isDesktopNav = useMediaQuery(NAV_BREAKPOINT);

  // Close the drawer on route change so a tap-through doesn't leave it open on
  // top of the new page, and on the way up past `sm` so it can't be left mounted
  // over a frame that already has its nav column back.
  useEffect(() => {
    closeNav();
  }, [pathname, isDesktopNav, closeNav]);

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

  // The rails read from the resolved nav, so they stay correct as the role
  // filter changes what exists.
  const activeHref = resolveActiveHref(config.groups, pathname);
  const activeLabel = flattenNavItems(config.groups).find(
    (item) => item.href === activeHref,
  )?.label;

  /**
   * The gate's content, or `null` once identity has resolved.
   *
   * A non-401 `/me` failure (500, timeout, CORS) never self-redirects — the
   * api-client only clears the session on a 401 — so a valid-token user would
   * otherwise hang on the loader forever. Surface a recovery path instead. A
   * token-less viewer is already being redirected (effect + api-client), so keep
   * the loader for that case rather than flashing an error card.
   */
  const hasToken =
    typeof window !== "undefined" &&
    Boolean(localStorage.getItem("access_token"));

  let gate: ReactNode = null;
  if (isError && hasToken) {
    gate = (
      <Stack align="center" gap="sm" maw={340}>
        <Text fw={600}>Couldn&apos;t verify your session</Text>
        <Text c="var(--ml-meta-ink)" size="sm" ta="center">
          Something went wrong while loading your account. Try again, or sign
          out and sign back in.
        </Text>
        <Group gap="sm" mt="xs">
          <Button variant="filled" onClick={() => refetch()}>
            Retry
          </Button>
          <Button variant="default" onClick={() => logoutMutate()}>
            Sign out
          </Button>
        </Group>
      </Stack>
    );
  } else if (isLoading || !user || user.password_change_required) {
    // Hold the app until identity resolves: loading, the "no user / redirect"
    // window, and the forced-password-change bounce all show the gate rather
    // than flashing the nav to an unauthenticated viewer.
    gate = <Loader size="sm" type="dots" />;
  }

  /*
   * One return, not an early one per state. The frame is permanent: swapping the
   * BODY keeps the rails, the border and the accent bar mounted across every
   * transition, where an early `return` would unmount and rebuild the whole
   * chrome each time `isLoading` flips.
   */
  return (
    <>
      <Box className={classes.root}>
        <Box className={classes.frame}>
          <TopRail
            brand={config.brand}
            linkComponent={config.linkComponent}
            meta={gate ? "Session" : "Sandbox · Mock API"}
            navOpened={navOpened}
            onToggleNav={toggleNav}
            // No nav to open yet, and the drawer isn't mounted — a burger here
            // would be a dead control.
            showNavTrigger={!gate}
          />

          {gate ? (
            <Box className={classes.gate}>{gate}</Box>
          ) : (
            <Box className={classes.body}>
              <Box
                className={classes.navCol}
                w={isCollapsed ? NAV_WIDTH_COLLAPSED : NAV_WIDTH}
                // The stored collapse preference only lands after rehydration.
                // Gating the width transition on it keeps a collapsed user from
                // watching the column animate 264 → 60px on every page load.
                data-hydrated={hasHydrated || undefined}
              >
                {/* The nav column's right rule crosses both rails — mark both. */}
                <CrossMark className={classes.navColTopJunction} />
                <CrossMark className={classes.navColBottomJunction} />
                <Sidebar
                  config={config}
                  pathname={pathname}
                  activeHref={activeHref}
                  collapsed={isCollapsed}
                  collapsible
                />
              </Box>

              <Box component="main" className={classes.content}>
                {children}
              </Box>
            </Box>
          )}

          <StatusRail
            section={gate ? "Authenticating" : activeLabel}
            pathname={pathname}
            version={SHELL_VERSION}
          />

          <Box className={classes.accentBar} aria-hidden />
        </Box>
      </Box>

      {/* Below `sm` the nav column leaves the frame. It keeps its own right rule
          so the drawer still reads as the same region, just detached.
          Composed rather than passed as props: `Drawer`'s `aria-label` would be
          spread onto the outer wrapper, leaving the `role="dialog"` itself with
          no accessible name (there is no title and no close button to supply
          one). `Drawer.Content` is the dialog, so the label goes there. */}
      {!gate && (
        <Drawer.Root
          opened={navOpened}
          onClose={closeNav}
          size={NAV_WIDTH}
          padding={0}
        >
          <Drawer.Overlay />
          <Drawer.Content
            aria-label="Navigation"
            className={classes.drawerContent}
          >
            <Drawer.Body className={classes.drawerBody}>
              <Sidebar
                config={config}
                pathname={pathname}
                activeHref={activeHref}
                collapsed={false}
                framed={false}
              />
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Root>
      )}

      {/* Mounted once, outside both Sidebars — two Spotlights would register the
          same shortcut twice. */}
      <NavSpotlight groups={config.groups} onNavigate={config.onNavigate} />

      <AccountModal opened={accountOpened} onClose={accountHandlers.close} />
    </>
  );
}
