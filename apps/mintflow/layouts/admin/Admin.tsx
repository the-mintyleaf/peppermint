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
import { LeafIcon } from "@phosphor-icons/react";
import styles from "./Admin.module.css";

export function LayoutAdmin({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const org = useSelectedOrgStore((s) => s.org);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/");
    }
  }, [router]);

  const config = useMemo(
    () => ({
      ...buildAdminConfig(org, undefined),
      linkComponent: Link,
    }),
    [org],
  );

  return (
    <AdminShell config={config} mainNavHeader={LeafIcon} pathname={pathname}>
      <Box className={styles.paperGrid} h="100%" mih="100%">
        {children}
      </Box>
    </AdminShell>
  );
}
