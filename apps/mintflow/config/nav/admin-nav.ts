import type { AdminShellConfig } from "@peppermint/admin";
import type { ReactNode } from "react";
import { KanbanIcon } from "@phosphor-icons/react/dist/csr/Kanban";
import { HouseIcon } from "@phosphor-icons/react/dist/csr/House";
import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";
import { BriefcaseIcon } from "@phosphor-icons/react/dist/csr/Briefcase";
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ClockCounterClockwise";
import { FlowArrowIcon } from "@phosphor-icons/react/dist/csr/FlowArrow";
import { InfoIcon } from "@phosphor-icons/react/dist/csr/Info";
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/csr/ShieldCheck";
import { TreeStructureIcon } from "@phosphor-icons/react/dist/csr/TreeStructure";
import { UsersIcon } from "@phosphor-icons/react/dist/csr/Users";
import { CheckSquareIcon } from "@phosphor-icons/react/dist/csr/CheckSquare";
import { ChartLineIcon } from "@phosphor-icons/react/dist/csr/ChartLine";
import { ListIcon } from "@phosphor-icons/react/dist/csr/List";
import { UserCircleIcon } from "@phosphor-icons/react/dist/csr/UserCircle";
import { IdentificationCardIcon } from "@phosphor-icons/react/dist/csr/IdentificationCard";
import { UserListIcon } from "@phosphor-icons/react/dist/csr/UserList";
import { LockKeyIcon } from "@phosphor-icons/react/dist/csr/LockKey";
import { KeyIcon } from "@phosphor-icons/react/dist/csr/Key";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import type { SelectedOrgInfo } from "../../stores/selectedOrg.store";

export function buildAdminConfig(
  org: SelectedOrgInfo | null,
  orgSwitcherWidget?: ReactNode,
): AdminShellConfig {
  return {
    brand: {
      icon: KanbanIcon,
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
        kind: "page",
        id: "account-security",
        icon: UserCircleIcon,
        label: "Account & Security",
        href: "/admin/account/security",
      },
      {
        kind: "module",
        id: "tasks",
        icon: CheckSquareIcon,
        label: "Tasks",
        subNav: {
          homeHref: "/admin/tasks",
          groups: [
            {
              label: "Tasks",
              items: [
                {
                  label: "Kanban Board",
                  href: "/admin/tasks",
                  icon: KanbanIcon,
                },
                {
                  label: "Tasks",
                  href: "/admin/tasks/general-view",
                  icon: ListIcon,
                },
                {
                  label: "Task Analytics",
                  href: "/admin/tasks/analytics",
                  icon: ChartLineIcon,
                },
              ],
            },
          ],
        },
      },
      {
        kind: "module",
        id: "organization",
        icon: BuildingsIcon,
        label: "Organization",
        subNav: {
          homeHref: "/admin/organization",
          groups: [
            {
              label: "Organization",
              items: [
                {
                  label: "Organizations",
                  href: "/admin/organization",
                  icon: BuildingsIcon,
                },
              ],
            },
            ...(org
              ? [
                  {
                    label: org.name,
                    headerWidget: orgSwitcherWidget,
                    items: [
                      {
                        label: "Overview",
                        href: `/admin/organization/${org.id}`,
                        icon: InfoIcon,
                      },
                      {
                        label: "Structure Builder",
                        href: `/admin/organization/${org.id}/structure`,
                        icon: TreeStructureIcon,
                      },
                      {
                        label: "Positions",
                        href: `/admin/organization/${org.id}/positions`,
                        icon: BriefcaseIcon,
                      },
                      {
                        label: "Members",
                        href: `/admin/organization/${org.id}/members`,
                        icon: UsersIcon,
                      },
                      {
                        label: "Reporting Lines",
                        href: `/admin/organization/${org.id}/reporting-lines`,
                        icon: FlowArrowIcon,
                      },
                      {
                        label: "Delegations",
                        href: `/admin/organization/${org.id}/delegations`,
                        icon: ShieldCheckIcon,
                      },
                      {
                        label: "Event Log",
                        href: `/admin/organization/${org.id}/event-log`,
                        icon: ClockCounterClockwiseIcon,
                      },
                    ],
                  },
                ]
              : []),
          ],
        },
      },
      {
        kind: "module",
        id: "authenticate",
        icon: IdentificationCardIcon,
        label: "Identity & Access Management",
        subNav: {
          homeHref: "/admin/authenticate/users",
          groups: [
            {
              label: "Users & Sessions",
              items: [
                {
                  label: "Users",
                  href: "/admin/authenticate/users",
                  icon: UserListIcon,
                },
              ],
            },
            {
              label: "Access Control",
              items: [
                {
                  label: "Roles & Bindings",
                  href: "/admin/authenticate/roles-bindings",
                  icon: LockKeyIcon,
                },
                {
                  label: "Direct Access",
                  href: "/admin/authenticate/direct-access",
                  icon: KeyIcon,
                },
                {
                  label: "Access Tools",
                  href: "/admin/authenticate/access-tools",
                  icon: MagnifyingGlassIcon,
                },
              ],
            },
          ],
        },
      },
    ],
  };
}
