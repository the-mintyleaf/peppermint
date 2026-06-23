"use client";

import { AdminShell } from "@peppermint/admin";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { adminShellConfig } from "@/config/nav/admin-nav";
import { AdminMainNavHeader } from "./AdminMainNavHeader";
import { KanbanIcon } from "@phosphor-icons/react/dist/ssr";

export function LayoutAdmin({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <AdminShell
      config={adminShellConfig}
      mainNavHeader={KanbanIcon}
      pathname={pathname}
    >
      {children}
    </AdminShell>
  );
}
