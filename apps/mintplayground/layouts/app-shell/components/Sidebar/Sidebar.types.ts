import type { AppShellConfig } from "../../AppShell.types";

export interface SidebarProps {
  /** Fully-resolved config, including `onNavigate` / `linkComponent`. */
  config: AppShellConfig;
  pathname: string;
  /** Active destination, resolved once by the shell and passed down. */
  activeHref?: string;
  /**
   * Icon-rail mode. Owned by the caller rather than read from the store, because
   * the drawer copy of this panel must render expanded regardless of the desktop
   * collapse preference.
   */
  collapsed: boolean;
  /** Show the collapse control. False in the drawer, where collapsing is moot. */
  collapsible?: boolean;
  /**
   * Whether this panel sits inside the shell frame. Inside it, an interior rule
   * meets the frame's left border and makes a junction there. Detached (the
   * drawer), that edge is the viewport with no rule on it — and a `+` on a free
   * end means nothing, so the start-side marks are dropped.
   */
  framed?: boolean;
}
