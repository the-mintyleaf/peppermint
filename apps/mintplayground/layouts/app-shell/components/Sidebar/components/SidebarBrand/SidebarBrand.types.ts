import type { ElementType } from "react";

import type { AppShellBrand } from "../../../../AppShell.types";

export interface SidebarBrandProps {
  brand: AppShellBrand;
  /** Anchor component for the brand link (Next `Link`). Defaults to `"a"`. */
  linkComponent?: ElementType;
  /** Collapsed icon-rail mode — render the mark only, no wordmark or caption. */
  collapsed: boolean;
}
