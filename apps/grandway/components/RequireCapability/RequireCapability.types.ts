import type { ReactNode } from "react";
import type { CapabilityName } from "@/config/access";

export interface RequireCapabilityProps {
  /**
   * The capability the account must hold. Omit to require only a verified session —
   * that is what `RequireAuth` does.
   */
  capability?: CapabilityName;
  children: ReactNode;
}
