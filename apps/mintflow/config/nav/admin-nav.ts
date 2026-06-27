import type { AdminShellConfig } from "@peppermint/admin";
import type { ReactNode } from "react";
import { KanbanIcon } from "@phosphor-icons/react/dist/csr/Kanban";
import { HouseIcon } from "@phosphor-icons/react/dist/csr/House";
import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";
import { BriefcaseIcon } from "@phosphor-icons/react/dist/csr/Briefcase";
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ClockCounterClockwise";
import { MapPinIcon } from "@phosphor-icons/react/dist/csr/MapPin";
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/csr/ShieldCheck";
import { TreeStructureIcon } from "@phosphor-icons/react/dist/csr/TreeStructure";
import { UsersIcon } from "@phosphor-icons/react/dist/csr/Users";
import { CheckSquareIcon } from "@phosphor-icons/react/dist/csr/CheckSquare";
import { ChartLineIcon } from "@phosphor-icons/react/dist/csr/ChartLine";
import { ListIcon } from "@phosphor-icons/react/dist/csr/List";
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
                  label: "General View",
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
                        label: "Sites",
                        href: `/admin/organization/${org.id}/sites`,
                        icon: MapPinIcon,
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
    ],
  };
}
