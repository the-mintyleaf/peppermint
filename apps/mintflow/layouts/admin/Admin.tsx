"use client";

import { AdminShell } from "@peppermint/admin";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { adminShellConfig } from "@/config/nav/admin-nav";
import { AdminMainNavHeader } from "./AdminMainNavHeader";

export function LayoutAdmin({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <AdminShell
      config={adminShellConfig}
      mainNavHeader={<AdminMainNavHeader />}
      pathname={pathname}
    >
      {children}
    </AdminShell>
  );
}
