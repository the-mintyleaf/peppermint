"use client";

import { AdminShell } from "@zetsel/admin";
import { ReactNode } from "react";

export function LayoutAdmin({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
