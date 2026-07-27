import type {
  AdminShellConfig,
  AdminShellMainNavItem,
  AdminShellNavGroup,
} from "@peppermint/admin";
import { HouseIcon } from "@phosphor-icons/react/dist/csr/House";
import { UserListIcon } from "@phosphor-icons/react/dist/csr/UserList";
import { IdentificationCardIcon } from "@phosphor-icons/react/dist/csr/IdentificationCard";
import { DesktopIcon } from "@phosphor-icons/react/dist/csr/Desktop";
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ClockCounterClockwise";
import { AddressBookIcon } from "@phosphor-icons/react/dist/csr/AddressBook";
import { UsersIcon } from "@phosphor-icons/react/dist/csr/Users";
import { UsersThreeIcon } from "@phosphor-icons/react/dist/csr/UsersThree";
import { CompassIcon } from "@phosphor-icons/react/dist/csr/Compass";
import { GraduationCapIcon } from "@phosphor-icons/react/dist/csr/GraduationCap";
import { BooksIcon } from "@phosphor-icons/react/dist/csr/Books";
import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";
import { BriefcaseIcon } from "@phosphor-icons/react/dist/csr/Briefcase";
import { HandshakeIcon } from "@phosphor-icons/react/dist/csr/Handshake";
import { FilesIcon } from "@phosphor-icons/react/dist/csr/Files";
import { FileTextIcon } from "@phosphor-icons/react/dist/csr/FileText";
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
  /** The Admin-only file review queue (`/admin/files/review`) — verify/archive/restore are Admin-only; a `lead_manager` never reaches this screen (`uploaded-files/docs/backend/INTEGRATION.md` §1). Files themselves have no standalone nav entry — every other files screen is embedded in another module's detail page. */
  canAccessFileReview?: boolean;
  /** The notifications bell (sidebar `additional`) — admin/lead_manager only, `superadmin` refused on every endpoint (`notifications/docs/backend/INTEGRATION.md` §1). */
  canAccessNotifications?: boolean;
  /** Unread notification count for the bell's badge — `undefined`/`0` renders no badge. */
  unreadNotificationCount?: number;
}

/**
 * Admin navigation, organised as workflow groups rather than a flat list of
 * modules. The rail mirrors the applicant lifecycle: **Recruitment**
 * (Leads → Applicants → Journeys → Offers), **Catalogue** (the study catalogue
 * and the country requirement checklists), **Documents** (workspaces + file
 * review), then **Clients** and **Administration** (Identity & Access + Audit).
 *
 * Access gating lives on the individual sub-nav items, not the rail entry: a
 * `module` group is only shown when the current role can reach at least one item
 * inside it (see `filterGroups` / the `push`-if-non-empty pattern below). So a
 * `lead_manager` — who cannot see Documents or Administration at all — never
 * gets an empty rail icon. Identity & Access and Audit are `isAdmin`-gated
 * (admin/superadmin), while Leads/Applicants/Offers are the mirror image:
 * admin/lead_manager, never superadmin
 * (`authenticate`/`audit`/`applicants` INTEGRATION.md §1).
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
    canAccessFileReview,
    canAccessNotifications,
    unreadNotificationCount,
  } = options;

  // The Placement dashboard is now the `/admin` home itself (it replaced the old
  // welcome page), so "Home" IS the dashboard for admin/lead_manager and the
  // identity/audit landing for superadmin — no separate "Dashboard" rail entry (a
  // second entry on the same `/admin` href would duplicate the destination and could
  // never show active, since the router matches the first `page` item for a pathname).
  const mainNav: AdminShellMainNavItem[] = [
    {
      kind: "page",
      id: "home",
      icon: HouseIcon,
      label: "Home",
      href: "/admin",
    },
  ];

  // ─── Recruitment ─── the applicant lifecycle funnel.
  const recruitmentGroups = (
    [
      canAccessLeads && {
        label: "Enquiries",
        items: [
          {
            label: "Leads",
            href: "/admin/lead-management",
            icon: AddressBookIcon,
          },
        ],
      },
      canAccessApplicants && {
        label: "Applicants",
        items: [
          {
            label: "All Applicants",
            href: "/admin/applicants",
            icon: UsersIcon,
          },
        ],
      },
      (canAccessApplicants || canAccessOffers) && {
        label: "Journeys",
        items: [
          ...(canAccessApplicants
            ? [
                {
                  label: "Journeys",
                  href: "/admin/applicant-journeys",
                  icon: CompassIcon,
                },
              ]
            : []),
          ...(canAccessOffers
            ? [
                {
                  label: "Offers",
                  href: "/admin/offers",
                  icon: HandshakeIcon,
                },
              ]
            : []),
        ],
      },
    ] as (AdminShellNavGroup | false)[]
  ).filter(Boolean) as AdminShellNavGroup[];

  if (recruitmentGroups.length > 0) {
    mainNav.push({
      kind: "module",
      id: "recruitment",
      icon: UsersThreeIcon,
      label: "Applicant Management",
      subNav: {
        homeHref: "/admin/lead-management",
        groups: recruitmentGroups,
      },
    });
  }

  // ─── Catalogue ─── study catalogue + country requirement checklists.
  const catalogueGroups = (
    [
      canAccessCatalogue && {
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
      canAccessChecklists && {
        label: "Requirements",
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
            label: "Requirement templates",
            href: "/admin/checklists/templates",
            icon: BooksIcon,
          },
        ],
      },
    ] as (AdminShellNavGroup | false)[]
  ).filter(Boolean) as AdminShellNavGroup[];

  if (catalogueGroups.length > 0) {
    mainNav.push({
      kind: "module",
      id: "catalogue",
      icon: GraduationCapIcon,
      label: "Catalogue",
      subNav: {
        homeHref: "/admin/institutions",
        groups: catalogueGroups,
      },
    });
  }

  // ─── Documents ─── editable document workspaces + the file review queue.
  // `reserved:` Document Templates (`/admin/documents/templates`) and Print
  // History (`/admin/documents/history`) belong in a "Templates & history"
  // group here — omitted until those routes exist so we never render a dead link.
  const documentsGroups = (
    [
      canAccessDocuments && {
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
      canAccessFileReview && {
        label: "Files",
        items: [
          {
            label: "File review",
            href: "/admin/files/review",
            icon: FileMagnifyingGlassIcon,
          },
        ],
      },
    ] as (AdminShellNavGroup | false)[]
  ).filter(Boolean) as AdminShellNavGroup[];

  if (documentsGroups.length > 0) {
    mainNav.push({
      kind: "module",
      id: "documents",
      icon: FilesIcon,
      label: "Documents",
      subNav: {
        homeHref: "/admin/documents",
        groups: documentsGroups,
      },
    });
  }

  if (canAccessClients) {
    mainNav.push({
      kind: "page",
      id: "clients",
      icon: BriefcaseIcon,
      label: "Clients",
      href: "/admin/clients",
    });
  }

  // ─── Administration ─── Identity & Access + the Audit trail (admin/superadmin).
  if (isAdmin) {
    mainNav.push({
      kind: "module",
      id: "administration",
      icon: IdentificationCardIcon,
      label: "Administration",
      subNav: {
        homeHref: "/admin/authenticate/users",
        groups: [
          {
            label: "Access",
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
          {
            label: "Activity",
            items: [
              {
                label: "Audit",
                href: "/admin/audit",
                icon: ClockCounterClockwiseIcon,
              },
            ],
          },
        ],
      },
    });
  }

  return {
    brand: {
      icon: IdentificationCardIcon,
      href: "/admin",
    },
    mainNav,
    additional: canAccessNotifications
      ? [
          {
            id: "notifications",
            icon: BellIcon,
            label: "Notifications",
            href: "/admin/notifications",
            // Capped so a very active feed doesn't overflow the sidebar's
            // small icon-corner indicator.
            badge: unreadNotificationCount
              ? unreadNotificationCount > 99
                ? "99+"
                : String(unreadNotificationCount)
              : undefined,
          },
        ]
      : undefined,
  };
}
