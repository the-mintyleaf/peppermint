import type { AdminShellNav } from "@zetsel/admin";
import { House as HouseIcon } from "@phosphor-icons/react/dist/csr/House";

export const adminNav: AdminShellNav = [
  {
    label: "Overview",
    items: [{ label: "Home", href: "/admin", icon: HouseIcon }],
  },
];
