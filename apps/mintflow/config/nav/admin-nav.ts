import type { AdminShellConfig } from "@peppermint/admin";
import { KanbanIcon } from "@phosphor-icons/react/dist/csr/Kanban";
import { HouseIcon } from "@phosphor-icons/react/dist/csr/House";
import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";
import { CheckSquareIcon } from "@phosphor-icons/react/dist/csr/CheckSquare";
import { ChartLineIcon } from "@phosphor-icons/react/dist/csr/ChartLine";
import { ListIcon } from "@phosphor-icons/react/dist/csr/List";

export const adminShellConfig: AdminShellConfig = {
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
        ],
      },
    },
  ],
};
