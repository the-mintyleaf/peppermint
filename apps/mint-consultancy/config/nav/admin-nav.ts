import type { AdminShellConfig } from "@zetsel/admin";
import { House as HouseIcon } from "@phosphor-icons/react/dist/csr/House";
import { Student as StudentIcon } from "@phosphor-icons/react/dist/csr/Student";
import { FileText as FileTextIcon } from "@phosphor-icons/react/dist/csr/FileText";
import { GearSix as GearSixIcon } from "@phosphor-icons/react/dist/csr/GearSix";
import { User as UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { KanbanIcon } from "@phosphor-icons/react/dist/csr/Kanban";

export const adminShellConfig: AdminShellConfig = {
  brand: {
    icon: KanbanIcon,
    href: "/admin",
  },
  mainNav: [
    {
      kind: "module",
      id: "overview",
      icon: HouseIcon,
      label: "Overview",
      subNav: {
        homeHref: "/admin",
        groups: [
          {
            label: "Overview",
            items: [{ label: "Home", href: "/admin", icon: HouseIcon }],
          },
        ],
      },
    },
    {
      kind: "module",
      id: "students",
      icon: StudentIcon,
      label: "Students",
      subNav: {
        homeHref: "/admin/students",
        groups: [
          {
            label: "Students",
            items: [
              {
                label: "All Students",
                href: "/admin/students",
                icon: StudentIcon,
              },
              {
                label: "Enrollments",
                href: "/admin/students/enrollments",
                icon: StudentIcon,
              },
            ],
          },
        ],
      },
    },
    {
      kind: "module",
      id: "documents",
      icon: FileTextIcon,
      label: "Documents",
      subNav: {
        homeHref: "/admin/documents",
        groups: [
          {
            label: "Documents",
            items: [
              {
                label: "All Documents",
                href: "/admin/documents",
                icon: FileTextIcon,
              },
              {
                label: "Templates",
                href: "/admin/documents/templates",
                icon: FileTextIcon,
              },
            ],
          },
        ],
      },
    },
    {
      kind: "module",
      id: "settings",
      icon: GearSixIcon,
      label: "Settings",
      subNav: {
        homeHref: "/admin/settings/staff",
        groups: [
          {
            label: "Settings",
            items: [
              { label: "Staff", href: "/admin/settings/staff", icon: UserIcon },
              { label: "Settings", href: "/admin/settings", icon: GearSixIcon },
            ],
          },
        ],
      },
    },
  ],
};
