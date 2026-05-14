"use client";

import { AppShell, useDisclosure } from "@zetsel/ui";
import { AdminShellNavbar } from "./components/Navbar/AdminShell.Navbar";
import type { AdminShellNav } from "./AdminShell.types";

import "mantine-datatable/styles.css";

interface AdminShellProps {
  children: React.ReactNode;
  nav?: AdminShellNav;
  pathname?: string;
}

export function AdminShell({ children, nav = [], pathname }: AdminShellProps) {
  const [opened, { toggle }] = useDisclosure();
  const [collapsedNav, navActions] = useDisclosure();

  return (
    <>
      <AppShell
        p={0}
        navbar={{
          width: collapsedNav ? 50 : 300,
          breakpoint: "sm",
          collapsed: { mobile: !opened },
        }}
      >
        <AdminShellNavbar
          collapsed={collapsedNav}
          onToggle={navActions.toggle}
          onOpen={navActions.close}
          onClose={navActions.open}
          nav={nav}
          pathname={pathname}
        />
        <AppShell.Main
          py={{
            lg: "8px",
          }}
          pr={{ lg: "8px" }}
        >
          <section
            style={{
              width: "calc(100%)",
              height: "calc(100vh - 16px)",
              background: "var(--mantine-color-white)",
              border: "1px solid var(--mantine-color-gray-4)",
              borderRadius: "var(--mantine-radius-md)",
              overflowY: "scroll",
            }}
          >
            {children}
          </section>
        </AppShell.Main>
      </AppShell>
    </>
  );
}
