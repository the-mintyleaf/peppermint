import { LayoutOrgShell } from "../../../../layouts/org-shell";
import type { ReactNode } from "react";

export default function OrgLayout({ children }: { children: ReactNode }) {
  return <LayoutOrgShell>{children}</LayoutOrgShell>;
}
