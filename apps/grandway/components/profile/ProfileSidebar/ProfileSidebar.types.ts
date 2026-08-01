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
  /**
   * Portrait for the avatar. Falls back to initials when absent, so a profile
   * with no picture (or one whose bytes failed to load) still renders the same
   * identity anchor rather than a hole. Resolving it is the caller's job — an
   * applicant's photograph, for instance, is an object URL minted from the
   * files API, not an address the record carries.
   */
  avatarSrc?: string | null;
  /** Shows a placeholder in the avatar's place while `avatarSrc` resolves. */
  avatarLoading?: boolean;
  /** The property list — a stack of `ProfileField`s. */
  fields?: ReactNode;
  /** Docked at the card's foot — the primary and lifecycle actions. */
  actions?: ReactNode;
}
