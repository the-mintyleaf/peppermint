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
import styles from "./Admin.module.css";

export function LayoutAdmin({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, isAdmin, isSuperadmin } = useCurrentUser();
  const { mutate: logoutMutate } = useLogout();
  const [settingsOpened, settingsHandlers] = useDisclosure(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/");
    }
  }, [router, pathname]);

  const profile = user?.employee_profile;

  const config = useMemo(
    () => ({
      ...buildAdminConfig(isAdmin, isSuperadmin),
      linkComponent: Link,
      onNavigate: (href: string) => router.push(href),
      userMenu: {
        variant: "icon" as const,
        user: user
          ? {
              first_name: profile?.first_name ?? user.username,
              last_name: profile?.last_name ?? "",
              username: user.username,
              email: profile?.email ?? "",
              roles: [role ?? "staff"],
            }
          : null,
        onLogout: () => logoutMutate(),
        onProfileClick: settingsHandlers.open,
      },
    }),
    [
      isAdmin,
      isSuperadmin,
      user,
      profile,
      role,
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
