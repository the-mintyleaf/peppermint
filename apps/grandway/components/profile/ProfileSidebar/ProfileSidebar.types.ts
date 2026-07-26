import type { ReactNode } from "react";

export interface ProfileSidebarProps {
  /** The profile's primary name — the page's identity anchor. */
  name: string;
  /** Optional line under the name (romanized name, a link to a parent record). */
  subtitle?: ReactNode;
  /** Status/stage indicator, shown under the name (a `Badge` or switch). */
  status?: ReactNode;
  /** Source for the avatar initials when it differs from `name`. */
  avatarLabel?: string;
  /** The property list — a stack of `ProfileField`s. */
  fields?: ReactNode;
  /** Docked at the card's foot — the primary and lifecycle actions. */
  actions?: ReactNode;
}
