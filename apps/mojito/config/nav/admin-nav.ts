import type { AdminShellConfig } from "@zetsel/admin";
import { ChartBarIcon } from "@phosphor-icons/react/dist/csr/ChartBar";
import { PenNibIcon } from "@phosphor-icons/react/dist/csr/PenNib";
import { ShareNetworkIcon } from "@phosphor-icons/react/dist/csr/ShareNetwork";
import { RobotIcon } from "@phosphor-icons/react/dist/csr/Robot";
import { ChartLineIcon } from "@phosphor-icons/react/dist/csr/ChartLine";
import { SparkleIcon } from "@phosphor-icons/react/dist/csr/Sparkle";
import { CalendarIcon } from "@phosphor-icons/react/dist/csr/Calendar";
import { LayoutIcon } from "@phosphor-icons/react/dist/csr/Layout";
import { ArchiveIcon } from "@phosphor-icons/react/dist/csr/Archive";
import { FlowArrowIcon } from "@phosphor-icons/react/dist/csr/FlowArrow";

export const adminShellConfig: AdminShellConfig = {
  brand: {
    icon: SparkleIcon,
    href: "/admin",
  },
  mainNav: [
    {
      kind: "page",
      id: "dashboard",
      icon: ChartBarIcon,
      label: "Dashboard",
      href: "/admin",
    },
    {
      kind: "module",
      id: "content",
      icon: PenNibIcon,
      label: "Content",
      subNav: {
        homeHref: "/admin/content/calendar",
        groups: [
          {
            label: "Content",
            items: [
              { label: "Content Calendar", href: "/admin/content/calendar", icon: CalendarIcon },
              { label: "Templates", href: "/admin/content/templates", icon: LayoutIcon },
              { label: "Content Library", href: "/admin/content/library", icon: ArchiveIcon },
            ],
          },
        ],
      },
    },
    {
      kind: "module",
      id: "channels",
      icon: ShareNetworkIcon,
      label: "Channels",
      subNav: {
        homeHref: "/admin/channels",
        groups: [
          {
            label: "Channels",
            items: [
              { label: "All Channels", href: "/admin/channels", icon: ShareNetworkIcon },
            ],
          },
        ],
      },
    },
    {
      kind: "module",
      id: "automation",
      icon: RobotIcon,
      label: "Automation",
      subNav: {
        homeHref: "/admin/automation/workflows",
        groups: [
          {
            label: "Automation",
            items: [
              { label: "Workflows", href: "/admin/automation/workflows", icon: FlowArrowIcon },
            ],
          },
        ],
      },
    },
    {
      kind: "module",
      id: "analytics",
      icon: ChartLineIcon,
      label: "Analytics",
      subNav: {
        homeHref: "/admin/analytics/overview",
        groups: [
          {
            label: "Analytics",
            items: [
              { label: "Overview", href: "/admin/analytics/overview", icon: ChartLineIcon },
            ],
          },
        ],
      },
    },
  ],
};
