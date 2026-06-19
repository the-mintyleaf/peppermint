import type { AdminShellConfig } from "@peppermint/admin";
import { KanbanIcon } from "@phosphor-icons/react/dist/csr/Kanban";
import { HouseIcon } from "@phosphor-icons/react/dist/csr/House";
import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";
import { TreeStructureIcon } from "@phosphor-icons/react/dist/csr/TreeStructure";
import { CreditCardIcon } from "@phosphor-icons/react/dist/csr/CreditCard";
import { UsersIcon } from "@phosphor-icons/react/dist/csr/Users";
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/csr/ShieldCheck";
import { EnvelopeSimpleIcon } from "@phosphor-icons/react/dist/csr/EnvelopeSimple";
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ClockCounterClockwise";
import { FileTextIcon } from "@phosphor-icons/react/dist/csr/FileText";
import { CheckSquareIcon } from "@phosphor-icons/react/dist/csr/CheckSquare";
import { ChartLineIcon } from "@phosphor-icons/react/dist/csr/ChartLine";

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
                icon: TreeStructureIcon,
              },
              {
                label: "Structure Builder",
                href: "/admin/organization/structure",
                icon: TreeStructureIcon,
              },
              {
                label: "Departments",
                href: "/admin/organization/departments",
                icon: BuildingsIcon,
              },
              {
                label: "Accounts",
                href: "/admin/organization/accounts",
                icon: CreditCardIcon,
              },
              {
                label: "Users",
                href: "/admin/organization/users",
                icon: UsersIcon,
              },
              {
                label: "Roles & Permissions",
                href: "/admin/organization/roles",
                icon: ShieldCheckIcon,
              },
              {
                label: "Invitations",
                href: "/admin/organization/invitations",
                icon: EnvelopeSimpleIcon,
              },
              {
                label: "Sessions",
                href: "/admin/organization/sessions",
                icon: ClockCounterClockwiseIcon,
              },
              {
                label: "Audit Logs",
                href: "/admin/organization/audit-logs",
                icon: FileTextIcon,
              },
            ],
          },
        ],
      },
    },
  ],
};
