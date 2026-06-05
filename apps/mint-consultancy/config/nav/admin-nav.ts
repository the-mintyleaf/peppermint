import type { AdminShellNav } from "@zetsel/admin";
import { House as HouseIcon } from "@phosphor-icons/react/dist/csr/House";
import { Student as StudentIcon } from "@phosphor-icons/react/dist/csr/Student";
import { FileText as FileTextIcon } from "@phosphor-icons/react/dist/csr/FileText";
import { GearSix as GearSixIcon } from "@phosphor-icons/react/dist/csr/GearSix";
import { User as UserIcon } from "@phosphor-icons/react/dist/csr/User";

export const adminNav: AdminShellNav = [
  {
    label: "Overview",
    items: [
      { label: "Home", href: "/admin", icon: HouseIcon },
    ],
  },
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
  {
    label: "Settings",
    items: [
      { label: "Staff", href: "/admin/settings/staff", icon: UserIcon },
      { label: "Settings", href: "/admin/settings", icon: GearSixIcon },
    ],
  },
];
