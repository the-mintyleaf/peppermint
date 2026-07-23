import type { AdminShellConfig } from "@peppermint/admin";
import { HouseIcon } from "@phosphor-icons/react/dist/csr/House";
import { UserListIcon } from "@phosphor-icons/react/dist/csr/UserList";
import { IdentificationCardIcon } from "@phosphor-icons/react/dist/csr/IdentificationCard";
import { DesktopIcon } from "@phosphor-icons/react/dist/csr/Desktop";
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ClockCounterClockwise";
import { AddressBookIcon } from "@phosphor-icons/react/dist/csr/AddressBook";
import { UsersIcon } from "@phosphor-icons/react/dist/csr/Users";
import { CompassIcon } from "@phosphor-icons/react/dist/csr/Compass";

export interface BuildAdminConfigOptions {
  isAdmin?: boolean;
  /** `admin` or `lead_manager` — the two tiers the leads backend accepts. `superadmin` is always excluded (`lead-management/docs/backend/INTEGRATION.md` §1). */
  canAccessLeads?: boolean;
  /** Same rule as `canAccessLeads` — `applicants`/`applicant_journeys` share the identical admin/lead_manager, never-superadmin access model. */
  canAccessApplicants?: boolean;
}

/**
 * Admin navigation. Identity & Access (Users, My Sessions) and Audit are admin/superadmin
 * only — a `lead_manager` never reaches `/admin/authenticate/*` or `/admin/audit`
 * (`authenticate/docs/INTEGRATION.md` §1, `audit/docs/INTEGRATION.md` §1). Leads and
 * Applicants are the mirror image: visible to `admin`/`lead_manager`, never to
 * `superadmin` (`applicants`/`applicant_journeys` INTEGRATION.md §1 — identical
 * access model to leads).
 */
export function buildAdminConfig(
  options: BuildAdminConfigOptions = {},
): AdminShellConfig {
  const { isAdmin, canAccessLeads, canAccessApplicants } = options;
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
      ...(canAccessLeads
        ? [
            {
              kind: "page" as const,
              id: "lead-management",
              icon: AddressBookIcon,
              label: "Leads",
              href: "/admin/lead-management",
            },
          ]
        : []),
      ...(canAccessApplicants
        ? [
            {
              kind: "module" as const,
              id: "applicants",
              icon: UsersIcon,
              label: "Applicants",
              subNav: {
                homeHref: "/admin/applicants",
                groups: [
                  {
                    label: "Records",
                    items: [
                      {
                        label: "All Applicants",
                        href: "/admin/applicants",
                        icon: UsersIcon,
                      },
                    ],
                  },
                  {
                    label: "Journeys",
                    items: [
                      {
                        label: "Journey Worklist",
                        href: "/admin/applicant-journeys",
                        icon: CompassIcon,
                      },
                    ],
                  },
                ],
              },
            },
          ]
        : []),
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
