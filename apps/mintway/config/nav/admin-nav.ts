import type { AdminShellConfig } from "@peppermint/admin";
import { HouseIcon } from "@phosphor-icons/react/dist/csr/House";
import { IdentificationCardIcon } from "@phosphor-icons/react/dist/csr/IdentificationCard";
import { UserListIcon } from "@phosphor-icons/react/dist/csr/UserList";
import { UsersThreeIcon } from "@phosphor-icons/react/dist/csr/UsersThree";
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ClockCounterClockwise";
import { FileTextIcon } from "@phosphor-icons/react/dist/csr/FileText";
import { SignatureIcon } from "@phosphor-icons/react/dist/csr/Signature";

/**
 * Admin navigation. The Identity & Access module is admin/superadmin only; the
 * Security Events feed within it is superadmin only (grandway `role` gates).
 */
export function buildAdminConfig(
  isAdmin?: boolean,
  isSuperadmin?: boolean,
): AdminShellConfig {
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
      {
        // Staff-reachable: the applicant list/detail/addresses are staff-permitted;
        // admin-only sections gate within each route.
        kind: "page",
        id: "applicants",
        icon: UsersThreeIcon,
        label: "Applicants",
        href: "/admin/applicants",
      },
      ...(isAdmin
        ? [
            {
              // Admin/superadmin-only server-side (staff get a 404). Rows open the
              // full-screen editor, which lives outside the admin shell.
              kind: "page" as const,
              id: "documents",
              icon: FileTextIcon,
              label: "Documents",
              href: "/admin/documents",
            },
            {
              kind: "page" as const,
              id: "signatures",
              icon: SignatureIcon,
              label: "Signatures",
              href: "/admin/signatures",
            },
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
                    ],
                  },
                  ...(isSuperadmin
                    ? [
                        {
                          label: "Audit",
                          items: [
                            {
                              label: "Security Events",
                              href: "/admin/authenticate/security-events",
                              icon: ClockCounterClockwiseIcon,
                            },
                          ],
                        },
                      ]
                    : []),
                ],
              },
            },
          ]
        : []),
    ],
  };
}
