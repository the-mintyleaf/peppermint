"use client";

import { useEffect, useMemo } from "react";
import { AdminShell } from "@peppermint/admin";
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
import styles from "./Admin.module.css";

export function LayoutAdmin({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, authorityType, isAdmin } = useCurrentUser();
  const { mutate: logoutMutate } = useLogout();
  const [settingsOpened, settingsHandlers] = useDisclosure(false);

  useEffect(() => {
    if (!hasAccessToken()) {
      router.replace("/");
    }
  }, [router, pathname]);

  const config = useMemo(
    () => ({
      ...buildAdminConfig(isAdmin),
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
    [isAdmin, user, authorityType, logoutMutate, settingsHandlers.open, router],
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
