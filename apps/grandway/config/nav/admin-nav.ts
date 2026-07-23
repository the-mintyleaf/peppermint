import type { AdminShellConfig } from "@peppermint/admin";
import { HouseIcon } from "@phosphor-icons/react/dist/csr/House";
import { UserListIcon } from "@phosphor-icons/react/dist/csr/UserList";
import { IdentificationCardIcon } from "@phosphor-icons/react/dist/csr/IdentificationCard";
import { DesktopIcon } from "@phosphor-icons/react/dist/csr/Desktop";
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ClockCounterClockwise";

/**
 * Admin navigation. Identity & Access (Users, My Sessions) and Audit are admin/superadmin
 * only — a `lead_manager` never reaches `/admin/authenticate/*` or `/admin/audit`
 * (`authenticate/docs/INTEGRATION.md` §1, `audit/docs/INTEGRATION.md` §1).
 */
export function buildAdminConfig(isAdmin?: boolean): AdminShellConfig {
  return {
    brand: {
      icon: IdentificationCardIcon,
      href: "/admin",
    },
    mainNav: [
      {
        kind: "page",
        id: "home",
        icon: HouseIcon,
        label: "Home",
        href: "/admin",
      },
      ...(isAdmin
        ? [
            {
              kind: "module" as const,
              id: "authenticate",
              icon: IdentificationCardIcon,
              label: "Identity & Access",
              subNav: {
                homeHref: "/admin/authenticate/users",
                groups: [
                  {
                    label: "Accounts",
                    items: [
                      {
                        label: "Users",
                        href: "/admin/authenticate/users",
                        icon: UserListIcon,
                      },
                      {
                        label: "My Sessions",
                        href: "/admin/authenticate/sessions",
                        icon: DesktopIcon,
                      },
                    ],
                  },
                ],
              },
            },
            {
              kind: "page" as const,
              id: "audit",
              icon: ClockCounterClockwiseIcon,
              label: "Audit",
              href: "/admin/audit",
            },
          ]
        : []),
    ],
  };
}
