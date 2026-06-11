import type { AdminShellConfig } from "@zetsel/admin";
import { ChartBarIcon } from "@phosphor-icons/react/dist/csr/ChartBar";
import { PenNibIcon } from "@phosphor-icons/react/dist/csr/PenNib";
import { RobotIcon } from "@phosphor-icons/react/dist/csr/Robot";
import { ChartLineIcon } from "@phosphor-icons/react/dist/csr/ChartLine";
import { SparkleIcon } from "@phosphor-icons/react/dist/csr/Sparkle";
import { CalendarIcon } from "@phosphor-icons/react/dist/csr/Calendar";
import { LayoutIcon } from "@phosphor-icons/react/dist/csr/Layout";
import { ArchiveIcon } from "@phosphor-icons/react/dist/csr/Archive";
import { FlowArrowIcon } from "@phosphor-icons/react/dist/csr/FlowArrow";
import { PaperPlaneTiltIcon } from "@phosphor-icons/react/dist/csr/PaperPlaneTilt";
import { SmileyIcon } from "@phosphor-icons/react/dist/csr/Smiley";
import { ShareNetworkIcon } from "@phosphor-icons/react/dist/csr/ShareNetwork";
import { ArticleIcon } from "@phosphor-icons/react/dist/csr/Article";

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
      id: "create",
      icon: PenNibIcon,
      label: "Create",
      subNav: {
        homeHref: "/admin/create",
        groups: [
          {
            label: "Create",
            items: [
              { label: "New Post", href: "/admin/create", icon: PenNibIcon },
            ],
          },
        ],
      },
    },
    {
      kind: "module",
      id: "publish",
      icon: PaperPlaneTiltIcon,
      label: "Publish",
      subNav: {
        homeHref: "/admin/publish/calendar",
        groups: [
          {
            label: "Publish",
            items: [
              { label: "Content Calendar", href: "/admin/publish/calendar", icon: CalendarIcon },
              { label: "Post History", href: "/admin/publish/library", icon: ArchiveIcon },
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
        homeHref: "/admin/analytics/post-analysis",
        groups: [
          {
            label: "Analytics",
            items: [
              {
                label: "Social Media Analysis",
                href: "/admin/analytics/social-media",
                icon: ShareNetworkIcon,
              },
              {
                label: "Sentiment Analysis",
                href: "/admin/analytics/sentiment",
                icon: SmileyIcon,
              },
              {
                label: "Post Analysis",
                href: "/admin/analytics/post-analysis",
                icon: ArticleIcon,
              },
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
        homeHref: "/admin/automation/templates",
        groups: [
          {
            label: "Automation",
            items: [
              { label: "Templates", href: "/admin/automation/templates", icon: LayoutIcon },
              { label: "Workflows", href: "/admin/automation/workflows", icon: FlowArrowIcon },
            ],
          },
        ],
      },
    },
  ],
};
