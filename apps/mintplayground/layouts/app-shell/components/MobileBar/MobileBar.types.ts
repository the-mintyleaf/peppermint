import type { ElementType } from "react";

import type { AppShellBrand } from "../../AppShell.types";

export interface MobileBarProps {
  brand: AppShellBrand;
  /** Anchor component for the brand link (Next `Link`). Defaults to `"a"`. */
  linkComponent?: ElementType;
  /** Drawer-nav state — the bar only renders below `sm`. */
  navOpened: boolean;
  onToggleNav: () => void;
  /**
   * Render the drawer trigger. False while the shell is gated: there is no nav
   * to open and no drawer mounted, so a burger would be a dead control.
   */
  showNavTrigger?: boolean;
}
