"use client";

import { useEffect, useMemo } from "react";
import { AdminShell, configureAppMutations } from "@peppermint/admin";
import { Box, useDisclosure } from "@peppermint/ui";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { IdentificationCardIcon } from "@phosphor-icons/react/dist/csr/IdentificationCard";
import { buildAdminConfig } from "@/config/nav/admin-nav";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import { useLogout } from "@/modules/admin/authenticate/_shared/useLogout";
import { AccountSettingsModal } from "@/modules/admin/authenticate/account-settings";
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
  const { user, authorityType, isAdmin, isLeadManager } = useCurrentUser();
  const { mutate: logoutMutate } = useLogout();
  const [settingsOpened, settingsHandlers] = useDisclosure(false);

  useEffect(() => {
    if (!hasAccessToken()) {
      router.replace("/");
    }
  }, [router, pathname]);

  const config = useMemo(
    () => ({
      ...buildAdminConfig({
        isAdmin,
        // Deliberately not `isAdmin` — that flag is true for `superadmin` too,
        // and the leads backend forbids `superadmin` on every endpoint.
        canAccessLeads: authorityType === "admin" || isLeadManager,
        // Same reasoning — applicants/applicant_journeys forbid `superadmin` too.
        canAccessApplicants: authorityType === "admin" || isLeadManager,
        // institutions & clients: shared reads (admin + lead_manager), never
        // superadmin — identical nav-visibility rule; the modules self-gate writes.
        canAccessCatalogue: authorityType === "admin" || isLeadManager,
        canAccessClients: authorityType === "admin" || isLeadManager,
        // offers: admin + lead_manager have identical full rights; superadmin denied.
        canAccessOffers: authorityType === "admin" || isLeadManager,
        // documents: Admin ONLY (reads included) — superadmin AND lead_manager both denied.
        canAccessDocuments: authorityType === "admin",
      }),
      linkComponent: Link,
      onNavigate: (href: string) => router.push(href),
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
      isAdmin,
      isLeadManager,
      user,
      authorityType,
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
    </AdminShell>
  );
}
