import type { AdminShellConfig } from "@zetsel/admin";
import { HouseIcon } from "@phosphor-icons/react/dist/csr/House";
import { StudentIcon } from "@phosphor-icons/react/dist/csr/Student";
import { FileTextIcon } from "@phosphor-icons/react/dist/csr/FileText";
import { GearSixIcon } from "@phosphor-icons/react/dist/csr/GearSix";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { GraduationCapIcon } from "@phosphor-icons/react/dist/csr/GraduationCap";

export const adminShellConfig: AdminShellConfig = {
  brand: {
    icon: GraduationCapIcon,
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
      id: "students",
      icon: StudentIcon,
      label: "Students",
      subNav: {
        homeHref: "/admin/students",
        groups: [
          {
            label: "Students",
            items: [
              { label: "All Students", href: "/admin/students", icon: StudentIcon },
              { label: "Enrollments", href: "/admin/students/enrollments", icon: StudentIcon },
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
              { label: "All Documents", href: "/admin/documents", icon: FileTextIcon },
              { label: "Templates", href: "/admin/documents/templates", icon: FileTextIcon },
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
        homeHref: "/admin/settings",
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
