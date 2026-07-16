import type { ReactNode } from "react";

import { LayoutAppShell } from "@/layouts/app-shell";

export default function AppLayout({ children }: { children: ReactNode }) {
  return <LayoutAppShell>{children}</LayoutAppShell>;
}
