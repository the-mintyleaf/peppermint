"use client";

import { AdminShell, MainNavIconButton } from "@zetsel/admin";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { adminShellConfig } from "@/config/nav/admin-nav";

export function LayoutAdmin({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const BrandIcon = adminShellConfig.brand.icon;

  return (
    <AdminShell
      config={adminShellConfig}
      mainNavHeader={
        <MainNavIconButton
          icon={BrandIcon}
          label="Brand"
          href={adminShellConfig.brand.href}
        />
      }
      pathname={pathname}
    >
      {children}
    </AdminShell>
  );
}
