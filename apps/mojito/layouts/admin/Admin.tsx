"use client";

import { AdminShell } from "@zetsel/admin";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { adminShellConfig } from "@/config/nav/admin-nav";

export function LayoutAdmin({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <AdminShell config={adminShellConfig} pathname={pathname}>
      {children}
    </AdminShell>
  );
}
