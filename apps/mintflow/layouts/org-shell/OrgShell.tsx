import type { ReactNode } from "react";
import { OrgNav } from "./components/OrgNav";

interface LayoutOrgShellProps {
  children: ReactNode;
}

export function LayoutOrgShell({ children }: LayoutOrgShellProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <OrgNav />
      <div style={{ flex: 1, overflow: "auto" }}>{children}</div>
    </div>
  );
}
