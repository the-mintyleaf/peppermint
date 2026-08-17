"use client";

import { useEffect, useMemo } from "react";
import { AdminShell, configureAppMutations } from "@peppermint/admin";
import { Box, useDisclosure } from "@peppermint/ui";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { IdentificationCardIcon } from "@phosphor-icons/react/dist/csr/IdentificationCard";
import { useCapabilities } from "@/config/access";
import { buildAdminConfig } from "@/config/nav/admin-nav";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import { useLogout } from "@/modules/admin/authenticate/_shared/useLogout";
import { AccountSettingsModal } from "@/modules/admin/authenticate/account-settings";
import { useNotificationSummary } from "@/modules/admin/notifications/notifications.hooks";
import { NotificationDrawer } from "@/modules/admin/notifications/drawer";
import { searchEverything } from "@/modules/admin/global-search";
import { hasAccessToken } from "@/lib/authTokens";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import styles from "./Admin.module.css";

// Runs once per client bundle load — gives every `useAppMutation` call in the
// app (currently only lead-management) the friendly error copy instead of the
// raw backend message.
configureAppMutations({ getErrorMessage: getApiErrorMessage });

export function LayoutAdmin({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, authorityType } = useCurrentUser();
  const caps = useCapabilities();
  const { mutate: logoutMutate } = useLogout();
  const [settingsOpened, settingsHandlers] = useDisclosure(false);
  const [notificationsOpened, notificationsHandlers] = useDisclosure(false);

  // A `superadmin` gets `NOTIFICATIONS_ACTOR_FORBIDDEN` on every endpoint, so
  // polling for one would just be a 403 every 30 seconds.
  const { data: notificationSummary } = useNotificationSummary(
    undefined,
    caps.notifications,
  );

  useEffect(() => {
    if (!hasAccessToken()) {
      router.replace("/");
    }
  }, [router, pathname]);

  // The same capabilities the nav is built from, reused as the search access
  // model — the spotlight must never surface a domain whose nav entry the role
  // cannot see, and every bucket must land somewhere that role can actually
  // open.
  //
  // The backend narrows what it *can* (a Lead Manager's leads and files), but
  // its own §9 records "should a Lead Manager see all applicants, documents and
  // catalogue records" as unresolved, and today those modules do not narrow
  // their own lists. This map is sent as the `types=` allowlist, so a bucket
  // this role could only dead-end in is never requested at all.
  const searchAccess = useMemo(
    () => ({
      applicants: caps.applicants,
      leads: caps.leads,
      clients: caps.clients,
      catalogue: caps.catalogue,
      documents: caps.documents,
      // Files have their own detail route; the backend already applies that
      // module's per-record visibility, so this gates the screen, not the rows.
      files: caps.fileReview,
      // Document templates and signatories both land on `/admin/documents` —
      // the workspaces roll-up — so the capability that governs reaching THAT
      // screen is the one to key on. It equals `documentWrite` for every tier
      // today, but they are separate rules and only this one is about the
      // destination.
      documentLibrary: caps.documentWorkspaces,
      checklists: caps.checklists,
    }),
    [caps],
  );

  const config = useMemo(
    () => ({
      // Every flag is a capability — the rules themselves live in `config/access`,
      // which is the only module that reads `authority_type`.
      ...buildAdminConfig({
        isAdmin: caps.users,
        canAccessLeads: caps.leads,
        canAccessApplicants: caps.applicants,
        canAccessCatalogue: caps.catalogue,
        canAccessClients: caps.clients,
        canAccessOffers: caps.offers,
        canAccessDocuments: caps.documents,
        canAccessDocumentWorkspaces: caps.documentWorkspaces,
        canAccessChecklists: caps.checklists,
        canAccessFileReview: caps.fileReview,
        canAccessNotifications: caps.notifications,
        unreadNotificationCount: notificationSummary?.unread,
        onNotificationsClick: notificationsHandlers.open,
      }),
      linkComponent: Link,
      onNavigate: (href: string) => router.push(href),
      // Omitted entirely for a `superadmin`, who is 403'd on both search
      // endpoints. The contract's instruction is to hide the box rather than
      // render one that always fails — a search that never works is worse than
      // no search at all.
      globalSearch: caps.search
        ? {
            search: (query: string, signal?: AbortSignal) =>
              searchEverything(query, { access: searchAccess, signal }),
            // The access model is a pure function of the tier, so the tier is
            // what partitions the result cache.
            scopeKey: authorityType ?? "anonymous",
            placeholder: "Search applicants, leads, files...",
            // Below two characters the endpoint 400s, so nothing is sent.
            minQueryLength: 2,
            // The search endpoint has its OWN 60/minute throttle, separate from
            // the project budget. A little slower than the shell's default,
            // deliberately: one request per settled query rather than per burst.
            debounceMs: 350,
          }
        : undefined,
      userMenu: {
        variant: "icon" as const,
        user: user
          ? {
              first_name: user.display_name || user.username,
              last_name: "",
              username: user.username,
              email: user.email,
              roles: [authorityType ?? "lead_manager"],
            }
          : null,
        onLogout: () => logoutMutate(),
        onProfileClick: settingsHandlers.open,
      },
    }),
    [
      caps,
      user,
      authorityType,
      notificationSummary?.unread,
      notificationsHandlers.open,
      searchAccess,
      logoutMutate,
      settingsHandlers.open,
      router,
    ],
  );

  return (
    <AdminShell
      config={config}
      mainNavHeader={IdentificationCardIcon}
      pathname={pathname}
    >
      <Box className={styles.paperGrid} h="100%" mih="100%">
        {children}
      </Box>
      {settingsOpened && (
        <AccountSettingsModal opened onClose={settingsHandlers.close} />
      )}
      {/* Gated by the same flag as the bell — `superadmin` is refused every
          notifications endpoint, so there is nothing to open. */}
      {caps.notifications && (
        <NotificationDrawer
          opened={notificationsOpened}
          onClose={notificationsHandlers.close}
        />
      )}
    </AdminShell>
  );
}
