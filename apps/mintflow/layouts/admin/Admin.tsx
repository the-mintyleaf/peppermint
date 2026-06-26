"use client";

import { useMemo } from "react";
import { AdminShell } from "@peppermint/admin";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { KanbanIcon } from "@phosphor-icons/react/dist/csr/Kanban";
import { buildAdminConfig } from "@/config/nav/admin-nav";
import { useSelectedOrgStore } from "@/stores/selectedOrg.store";

export function LayoutAdmin({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const org = useSelectedOrgStore((s) => s.org);

  const config = useMemo(() => buildAdminConfig(org), [org]);

  return (
    <AdminShell config={config} mainNavHeader={KanbanIcon} pathname={pathname}>
      {children}
    </AdminShell>
  );
}
