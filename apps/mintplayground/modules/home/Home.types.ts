import type { CurrentUser } from "@/modules/auth/_shared/auth.types";

/** One "what's wired up" entry on the home page. */
export interface CapabilityItem {
  id: string;
  label: string;
  detail: string;
  /** Whether the thing is actually built, or just scaffolded for later. */
  status: "ready" | "placeholder";
}

export interface SessionPanelProps {
  user: CurrentUser;
}

export interface CapabilityGridProps {
  items: CapabilityItem[];
}
