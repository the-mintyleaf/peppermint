"use client";

import { useEffect, useMemo } from "react";
import { AdminShell } from "@peppermint/admin";
import { Box } from "@peppermint/ui";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { KanbanIcon } from "@phosphor-icons/react/dist/csr/Kanban";
import { buildAdminConfig } from "@/config/nav/admin-nav";
import { useSelectedOrgStore } from "@/stores/selectedOrg.store";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import { useLogout } from "@/modules/admin/authenticate/_shared/useLogout";
import { LeafIcon } from "@phosphor-icons/react";
import styles from "./Admin.module.css";

export function LayoutAdmin({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const org = useSelectedOrgStore((s) => s.org);
  const { user, isStaff } = useCurrentUser();
  const { mutate: logoutMutate } = useLogout();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    // The Structure Test Tree is an offline, no-backend playground — never bounce
    // it to sign-in for a missing session.
    if (!token && pathname !== "/admin/organization/test-tree") {
      router.replace("/");
    }
  }, [router, pathname]);

  const config = useMemo(
    () => ({
      ...buildAdminConfig(org, undefined, isStaff),
      linkComponent: Link,
      userMenu: {
        variant: "icon" as const,
        user: user
          ? {
              first_name: user.display_name,
              last_name: "",
              username: user.username,
              email: user.email ?? "",
              roles: [isStaff ? "admin" : "member"],
            }
          : null,
        onLogout: () => logoutMutate(),
      },
    }),
    [org, isStaff, user, logoutMutate],
  );

  return (
    <AdminShell config={config} mainNavHeader={LeafIcon} pathname={pathname}>
      <Box className={styles.paperGrid} h="100%" mih="100%">
        {children}
      </Box>
    </AdminShell>
  );
}
