"use client";

import { RequireCapability } from "@/components/RequireCapability";
import type { RequireAuthProps } from "./RequireAuth.types";

/**
 * Gate content behind *any* authenticated Grandway account
 * (superadmin/admin/lead_manager). This only guards against an unverifiable session —
 * object-level authority rules are capabilities and live in `config/access`.
 */
export function RequireAuth({ children }: RequireAuthProps) {
  return <RequireCapability>{children}</RequireCapability>;
}
