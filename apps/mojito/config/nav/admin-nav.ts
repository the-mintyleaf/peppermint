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
import { ChatTeardropDotsIcon } from "@phosphor-icons/react/dist/csr/ChatTeardropDots";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { AtIcon } from "@phosphor-icons/react/dist/csr/At";
import { HashIcon } from "@phosphor-icons/react/dist/csr/Hash";
import { UsersIcon } from "@phosphor-icons/react/dist/csr/Users";
import { BellIcon } from "@phosphor-icons/react/dist/csr/Bell";
import { ImagesIcon } from "@phosphor-icons/react/dist/csr/Images";
import { PaintBucketIcon } from "@phosphor-icons/react/dist/csr/PaintBucket";
import { LinkIcon } from "@phosphor-icons/react/dist/csr/Link";
import { PlugIcon } from "@phosphor-icons/react/dist/csr/Plug";
import { GearIcon } from "@phosphor-icons/react/dist/csr/Gear";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";
import { CreditCardIcon } from "@phosphor-icons/react/dist/csr/CreditCard";
import { QueueIcon } from "@phosphor-icons/react/dist/csr/Queue";
import { FileTextIcon } from "@phosphor-icons/react/dist/csr/FileText";
import { CheckSquareIcon } from "@phosphor-icons/react/dist/csr/CheckSquare";
import { PlayIcon } from "@phosphor-icons/react/dist/csr/Play";
import { ChartPieIcon } from "@phosphor-icons/react/dist/csr/ChartPie";
import { TrendUpIcon } from "@phosphor-icons/react/dist/csr/TrendUp";
import { ChartBarHorizontalIcon } from "@phosphor-icons/react/dist/csr/ChartBarHorizontal";
import { CurrencyDollarIcon } from "@phosphor-icons/react/dist/csr/CurrencyDollar";
import { ChartScatterIcon } from "@phosphor-icons/react/dist/csr/ChartScatter";

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
            label: "Compose",
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
              { label: "Calendar", href: "/admin/publish/calendar", icon: CalendarIcon },
              { label: "Queue", href: "/admin/publish/queue", icon: QueueIcon },
              { label: "Drafts", href: "/admin/publish/drafts", icon: FileTextIcon },
              { label: "Library", href: "/admin/publish/library", icon: ArchiveIcon },
              { label: "Approvals", href: "/admin/publish/approvals", icon: CheckSquareIcon },
            ],
          },
        ],
      },
    },
    {
      kind: "module",
      id: "engage",
      icon: ChatTeardropDotsIcon,
      label: "Engage",
      subNav: {
        homeHref: "/admin/engage/inbox",
        groups: [
          {
            label: "Engage",
            items: [
              { label: "Inbox", href: "/admin/engage/inbox", icon: ChatTeardropDotsIcon },
            ],
          },
        ],
      },
    },
    {
      kind: "module",
      id: "listening",
      icon: MagnifyingGlassIcon,
      label: "Listening",
      subNav: {
        homeHref: "/admin/listening/mentions",
        groups: [
          {
            label: "Listening",
            items: [
              { label: "Mentions", href: "/admin/listening/mentions", icon: AtIcon },
              { label: "Keywords & Hashtags", href: "/admin/listening/keywords", icon: HashIcon },
              { label: "Competitors", href: "/admin/listening/competitors", icon: UsersIcon },
              { label: "Sentiment Stream", href: "/admin/listening/sentiment", icon: SmileyIcon },
              { label: "Alerts", href: "/admin/listening/alerts", icon: BellIcon },
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
              { label: "Runs & Monitoring", href: "/admin/automation/runs", icon: PlayIcon },
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
              { label: "Overview", href: "/admin/analytics/overview", icon: ChartPieIcon },
              { label: "Post Analysis", href: "/admin/analytics/post-analysis", icon: ArticleIcon },
              { label: "Channel Performance", href: "/admin/analytics/channels", icon: ShareNetworkIcon },
              { label: "Audience", href: "/admin/analytics/audience", icon: UsersIcon },
              { label: "Sentiment", href: "/admin/analytics/sentiment", icon: SmileyIcon },
              { label: "Benchmark", href: "/admin/analytics/benchmark", icon: ChartBarHorizontalIcon },
              { label: "ROI / Attribution", href: "/admin/analytics/roi", icon: CurrencyDollarIcon },
              { label: "Reports", href: "/admin/analytics/reports", icon: FileTextIcon },
            ],
          },
        ],
      },
    },
    {
      kind: "module",
      id: "assets",
      icon: ImagesIcon,
      label: "Assets",
      subNav: {
        homeHref: "/admin/assets/media",
        groups: [
          {
            label: "Assets",
            items: [
              { label: "Media Library", href: "/admin/assets/media", icon: ImagesIcon },
              { label: "Brand Kit", href: "/admin/assets/brand-kit", icon: PaintBucketIcon },
              { label: "Link-in-Bio", href: "/admin/assets/link-in-bio", icon: LinkIcon },
            ],
          },
        ],
      },
    },
    {
      kind: "module",
      id: "channels",
      icon: PlugIcon,
      label: "Channels",
      subNav: {
        homeHref: "/admin/channels",
        groups: [
          {
            label: "Channels",
            items: [
              { label: "Accounts", href: "/admin/channels", icon: PlugIcon },
              { label: "Connect", href: "/admin/channels/connect", icon: ShareNetworkIcon },
              { label: "Channel Settings", href: "/admin/channels/settings", icon: GearIcon },
            ],
          },
        ],
      },
    },
    {
      kind: "module",
      id: "settings",
      icon: GearIcon,
      label: "Settings",
      subNav: {
        homeHref: "/admin/settings/profile",
        groups: [
          {
            label: "Settings",
            items: [
              { label: "Profile", href: "/admin/settings/profile", icon: UserIcon },
              { label: "Workspace", href: "/admin/settings/workspace", icon: BuildingsIcon },
              { label: "Team & Roles", href: "/admin/settings/team", icon: UsersIcon },
              { label: "Notifications", href: "/admin/settings/notifications", icon: BellIcon },
              { label: "Integrations", href: "/admin/settings/integrations", icon: PlugIcon },
              { label: "Billing & Plan", href: "/admin/settings/billing", icon: CreditCardIcon },
            ],
          },
        ],
      },
    },
  ],
};
