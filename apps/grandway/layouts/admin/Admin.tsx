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

  // The same capabilities the nav is built from, reused as the search access model —
  // the spotlight must never query a domain whose nav entry the role can't see.
  const searchAccess = useMemo(
    () => ({
      applicants: caps.applicants,
      leads: caps.leads,
      clients: caps.clients,
      catalogue: caps.catalogue,
      documents: caps.documents,
      documentBankFamilies: caps.documentBankFamilies,
      // A hit lands on `/admin/documents` — the workspaces roll-up — so the
      // capability that governs reaching THAT screen is the one to key on. It
      // equals `documentWrite` for every tier today, but they are separate rules
      // and only this one is about the destination.
      signatories: caps.documentWorkspaces,
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
      globalSearch: {
        search: (query: string, signal?: AbortSignal) =>
          searchEverything(query, { access: searchAccess, signal }),
        // The access model is a pure function of the tier, so the tier is what
        // partitions the result cache.
        scopeKey: authorityType ?? "anonymous",
        placeholder: "Search applicants, leads, clients...",
      },
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
