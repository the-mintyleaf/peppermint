"use client";

import { AdminShell } from "@zetsel/admin";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { adminNav } from "@/config/nav/admin-nav";
import { adminHeaderConfig } from "@/config/header/admin-header";

export function LayoutAdmin({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <AdminShell
      nav={adminNav}
      pathname={pathname}
      headerConfig={adminHeaderConfig}
    >
      {children}
    </AdminShell>
  );
}
