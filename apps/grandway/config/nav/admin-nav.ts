import type { AdminShellConfig } from "@peppermint/admin";
import { HouseIcon } from "@phosphor-icons/react/dist/csr/House";
import { UserListIcon } from "@phosphor-icons/react/dist/csr/UserList";
import { IdentificationCardIcon } from "@phosphor-icons/react/dist/csr/IdentificationCard";
import { DesktopIcon } from "@phosphor-icons/react/dist/csr/Desktop";
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ClockCounterClockwise";
import { AddressBookIcon } from "@phosphor-icons/react/dist/csr/AddressBook";
import { UsersIcon } from "@phosphor-icons/react/dist/csr/Users";
import { CompassIcon } from "@phosphor-icons/react/dist/csr/Compass";
import { GraduationCapIcon } from "@phosphor-icons/react/dist/csr/GraduationCap";
import { BooksIcon } from "@phosphor-icons/react/dist/csr/Books";
import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";
import { BriefcaseIcon } from "@phosphor-icons/react/dist/csr/Briefcase";
import { HandshakeIcon } from "@phosphor-icons/react/dist/csr/Handshake";
import { FilesIcon } from "@phosphor-icons/react/dist/csr/Files";
import { FileTextIcon } from "@phosphor-icons/react/dist/csr/FileText";
import { ChartBarIcon } from "@phosphor-icons/react/dist/csr/ChartBar";
import { ListChecksIcon } from "@phosphor-icons/react/dist/csr/ListChecks";
import { FileMagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/FileMagnifyingGlass";
import { BellIcon } from "@phosphor-icons/react/dist/csr/Bell";
import { ClockIcon } from "@phosphor-icons/react/dist/csr/Clock";

export interface BuildAdminConfigOptions {
  isAdmin?: boolean;
  /** `admin` or `lead_manager` — the two tiers the leads backend accepts. `superadmin` is always excluded (`lead-management/docs/backend/INTEGRATION.md` §1). */
  canAccessLeads?: boolean;
  /** Same rule as `canAccessLeads` — `applicants`/`applicant_journeys` share the identical admin/lead_manager, never-superadmin access model. */
  canAccessApplicants?: boolean;
  /** `institutions` catalogue — reads are shared with `lead_manager`, writes are Admin-only, `superadmin` denied (`institutions/docs/backend/INTEGRATION.md` §1). Same nav-visibility rule as leads/applicants; the module self-gates writes. */
  canAccessCatalogue?: boolean;
  /** `clients` directory — same shared-read / admin-write / never-superadmin model as the catalogue (`clients/docs/backend/INTEGRATION.md` §1). */
  canAccessClients?: boolean;
  /** `offers` — full rights for admin AND lead_manager alike (no read/write split), `superadmin` denied (`offers/docs/backend/INTEGRATION.md` §1). */
  canAccessOffers?: boolean;
  /** `documents` — the strictest model: Admin only, reads included; `lead_manager` AND `superadmin` are both 403'd on every route (`documents/docs/SECURITY.md`). Hidden entirely for non-admins, never read-only. */
  canAccessDocuments?: boolean;
  /** `checklists` — reads (worklist, awaiting-setup, templates) are admin/lead_manager; template authoring is Admin-only and self-gated inline within the module. `superadmin` denied on every route (`checklists/docs/backend/INTEGRATION.md` §1). */
  canAccessChecklists?: boolean;
  /** `dashboard` — admin/lead_manager only; `superadmin` gets 403 on every section (`dashboard/docs/backend/INTEGRATION.md` §1/§8) — hide the entry entirely rather than link to an empty page. */
  canAccessDashboard?: boolean;
  /** The Admin-only file review queue (`/admin/files/review`) — verify/archive/restore are Admin-only; a `lead_manager` never reaches this screen (`uploaded-files/docs/backend/INTEGRATION.md` §1). Files themselves have no standalone nav entry — every other files screen is embedded in another module's detail page. */
  canAccessFileReview?: boolean;
  /** The notifications bell (sidebar `additional`) — admin/lead_manager only, `superadmin` refused on every endpoint (`notifications/docs/backend/INTEGRATION.md` §1). */
  canAccessNotifications?: boolean;
  /** Unread notification count for the bell's badge — `undefined`/`0` renders no badge. */
  unreadNotificationCount?: number;
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
  const {
    isAdmin,
    canAccessLeads,
    canAccessApplicants,
    canAccessCatalogue,
    canAccessClients,
    canAccessOffers,
    canAccessDocuments,
    canAccessChecklists,
    canAccessDashboard,
    canAccessFileReview,
    canAccessNotifications,
    unreadNotificationCount,
  } = options;
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
      ...(canAccessDashboard
        ? [
            {
              kind: "page" as const,
              id: "dashboard",
              icon: ChartBarIcon,
              label: "Dashboard",
              href: "/admin/dashboard",
            },
          ]
        : []),
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
      ...(canAccessCatalogue
        ? [
            {
              kind: "module" as const,
              id: "institutions",
              icon: GraduationCapIcon,
              label: "Catalogue",
              subNav: {
                homeHref: "/admin/institutions",
                groups: [
                  {
                    label: "Study catalogue",
                    items: [
                      {
                        label: "Programs",
                        href: "/admin/institutions",
                        icon: BooksIcon,
                      },
                      {
                        label: "Institutions",
                        href: "/admin/institutions/providers",
                        icon: BuildingsIcon,
                      },
                    ],
                  },
                ],
              },
            },
          ]
        : []),
      ...(canAccessOffers
        ? [
            {
              kind: "page" as const,
              id: "offers",
              icon: HandshakeIcon,
              label: "Offers",
              href: "/admin/offers",
            },
          ]
        : []),
      ...(canAccessChecklists
        ? [
            {
              kind: "module" as const,
              id: "checklists",
              icon: ListChecksIcon,
              label: "Checklists",
              subNav: {
                homeHref: "/admin/checklists",
                groups: [
                  {
                    label: "Checklists",
                    items: [
                      {
                        label: "Worklist",
                        href: "/admin/checklists",
                        icon: ListChecksIcon,
                      },
                      {
                        label: "Awaiting setup",
                        href: "/admin/checklists/awaiting-setup",
                        icon: ClockIcon,
                      },
                      {
                        label: "Templates",
                        href: "/admin/checklists/templates",
                        icon: BooksIcon,
                      },
                    ],
                  },
                ],
              },
            },
          ]
        : []),
      ...(canAccessDocuments
        ? [
            {
              kind: "module" as const,
              id: "documents",
              icon: FilesIcon,
              label: "Documents",
              subNav: {
                homeHref: "/admin/documents",
                groups: [
                  {
                    label: "Documents",
                    items: [
                      {
                        label: "Workspaces",
                        href: "/admin/documents",
                        icon: FilesIcon,
                      },
                      {
                        label: "All documents",
                        href: "/admin/documents/all",
                        icon: FileTextIcon,
                      },
                    ],
                  },
                ],
              },
            },
          ]
        : []),
      ...(canAccessFileReview
        ? [
            {
              kind: "page" as const,
              id: "file-review",
              icon: FileMagnifyingGlassIcon,
              label: "File Review",
              href: "/admin/files/review",
            },
          ]
        : []),
      ...(canAccessClients
        ? [
            {
              kind: "page" as const,
              id: "clients",
              icon: BriefcaseIcon,
              label: "Clients",
              href: "/admin/clients",
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
    additional: canAccessNotifications
      ? [
          {
            id: "notifications",
            icon: BellIcon,
            label: "Notifications",
            href: "/admin/notifications",
            badge: unreadNotificationCount
              ? String(unreadNotificationCount)
              : undefined,
          },
        ]
      : undefined,
  };
}
