import type { ElementType } from "react";

import type { AppShellBrand } from "../../AppShell.types";

export interface TopRailProps {
  brand: AppShellBrand;
  /** Anchor component for the brand link (Next `Link`). Defaults to `"a"`. */
  linkComponent?: ElementType;
  /** Uppercase mono marker in the rail's right slot (e.g. "SANDBOX · MOCK API"). */
  meta: string;
  /** Drawer-nav state — the trigger is rendered below `sm` only. */
  navOpened: boolean;
  onToggleNav: () => void;
  /**
   * Render the drawer trigger. False while the shell is gated: there is no nav
   * to open and no drawer mounted, so a burger would be a dead control.
   */
  showNavTrigger?: boolean;
}
