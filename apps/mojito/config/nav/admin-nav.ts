import type { AdminShellConfig } from "@zetsel/admin";
import { ChartBarIcon } from "@phosphor-icons/react/dist/csr/ChartBar";
import { PenNibIcon } from "@phosphor-icons/react/dist/csr/PenNib";
import { ShareNetworkIcon } from "@phosphor-icons/react/dist/csr/ShareNetwork";
import { RobotIcon } from "@phosphor-icons/react/dist/csr/Robot";
import { ChartLineIcon } from "@phosphor-icons/react/dist/csr/ChartLine";
import { UsersIcon } from "@phosphor-icons/react/dist/csr/Users";
import { GearSixIcon } from "@phosphor-icons/react/dist/csr/GearSix";
import { SparkleIcon } from "@phosphor-icons/react/dist/csr/Sparkle";
import { ArticleIcon } from "@phosphor-icons/react/dist/csr/Article";
import { CalendarIcon } from "@phosphor-icons/react/dist/csr/Calendar";
import { FileDashedIcon } from "@phosphor-icons/react/dist/csr/FileDashed";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { MagicWandIcon } from "@phosphor-icons/react/dist/csr/MagicWand";
import { LayoutIcon } from "@phosphor-icons/react/dist/csr/Layout";
import { ImagesIcon } from "@phosphor-icons/react/dist/csr/Images";
import { HashIcon } from "@phosphor-icons/react/dist/csr/Hash";
import { StampIcon } from "@phosphor-icons/react/dist/csr/Stamp";
import { InstagramLogoIcon } from "@phosphor-icons/react/dist/csr/InstagramLogo";
import { TwitterLogoIcon } from "@phosphor-icons/react/dist/csr/TwitterLogo";
import { LinkedinLogoIcon } from "@phosphor-icons/react/dist/csr/LinkedinLogo";
import { TiktokLogoIcon } from "@phosphor-icons/react/dist/csr/TiktokLogo";
import { PlugsConnectedIcon } from "@phosphor-icons/react/dist/csr/PlugsConnected";
import { FlowArrowIcon } from "@phosphor-icons/react/dist/csr/FlowArrow";
import { ChatCircleIcon } from "@phosphor-icons/react/dist/csr/ChatCircle";
import { ChatsCircleIcon } from "@phosphor-icons/react/dist/csr/ChatsCircle";
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/csr/ShieldCheck";
import { QueueIcon } from "@phosphor-icons/react/dist/csr/Queue";
import { LightningIcon } from "@phosphor-icons/react/dist/csr/Lightning";
import { BrainIcon } from "@phosphor-icons/react/dist/csr/Brain";
import { FunnelIcon } from "@phosphor-icons/react/dist/csr/Funnel";
import { ListBulletsIcon } from "@phosphor-icons/react/dist/csr/ListBullets";
import { TrendUpIcon } from "@phosphor-icons/react/dist/csr/TrendUp";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { HeartIcon } from "@phosphor-icons/react/dist/csr/Heart";
import { UserCircleIcon } from "@phosphor-icons/react/dist/csr/UserCircle";
import { TagIcon } from "@phosphor-icons/react/dist/csr/Tag";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { BellIcon } from "@phosphor-icons/react/dist/csr/Bell";
import { CurrencyDollarIcon } from "@phosphor-icons/react/dist/csr/CurrencyDollar";

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
        homeHref: "/admin/content/posts",
        groups: [
          {
            label: "Posts",
            items: [
              { label: "All Posts", href: "/admin/content/posts", icon: ArticleIcon },
              { label: "Drafts", href: "/admin/content/drafts", icon: FileDashedIcon, badge: "4" },
              { label: "Published", href: "/admin/content/published", icon: CheckCircleIcon },
            ],
          },
          {
            label: "Scheduling",
            items: [
              { label: "Scheduled", href: "/admin/content/scheduled", icon: CalendarIcon },
              { label: "Content Calendar", href: "/admin/content/calendar", icon: CalendarIcon },
              { label: "Approvals", href: "/admin/content/approvals", icon: StampIcon, badge: "2" },
            ],
          },
          {
            label: "Contents",
            items: [
              { label: "AI Generator", href: "/admin/content/ai-generator", icon: MagicWandIcon },
              { label: "Templates", href: "/admin/content/templates", icon: LayoutIcon },
              { label: "Media Library", href: "/admin/content/media", icon: ImagesIcon },
              { label: "Hashtags", href: "/admin/content/hashtags", icon: HashIcon },
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
            label: "Connected",
            items: [
              { label: "All Channels", href: "/admin/channels", icon: ShareNetworkIcon },
              { label: "Instagram", href: "/admin/channels/instagram", icon: InstagramLogoIcon },
              { label: "X / Twitter", href: "/admin/channels/twitter", icon: TwitterLogoIcon },
              { label: "LinkedIn", href: "/admin/channels/linkedin", icon: LinkedinLogoIcon },
              { label: "TikTok", href: "/admin/channels/tiktok", icon: TiktokLogoIcon },
            ],
          },
          {
            label: "Setup",
            items: [
              { label: "Connect Account", href: "/admin/channels/connect", icon: PlugsConnectedIcon },
              { label: "Posting Rules", href: "/admin/channels/rules", icon: FunnelIcon },
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
              { label: "Auto-Reply", href: "/admin/automation/auto-reply", icon: ChatCircleIcon },
              { label: "DM Bots", href: "/admin/automation/dm-bots", icon: ChatsCircleIcon },
              { label: "Comment Moderation", href: "/admin/automation/moderation", icon: ShieldCheckIcon },
              { label: "Post Queues", href: "/admin/automation/queues", icon: QueueIcon },
              { label: "Triggers", href: "/admin/automation/triggers", icon: LightningIcon },
              { label: "AI Agents", href: "/admin/automation/ai-agents", icon: BrainIcon },
              { label: "Rules Engine", href: "/admin/automation/rules", icon: FunnelIcon },
              { label: "Integrations", href: "/admin/automation/integrations", icon: PlugsConnectedIcon },
              { label: "Activity Log", href: "/admin/automation/activity", icon: ListBulletsIcon },
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
            label: "Performance",
            items: [
              { label: "Overview", href: "/admin/analytics/overview", icon: ChartLineIcon },
              { label: "Engagement", href: "/admin/analytics/engagement", icon: HeartIcon },
              { label: "Reach", href: "/admin/analytics/reach", icon: EyeIcon },
              { label: "Growth", href: "/admin/analytics/growth", icon: TrendUpIcon },
              { label: "Reports", href: "/admin/analytics/reports", icon: ArticleIcon },
            ],
          },
        ],
      },
    },
    {
      kind: "module",
      id: "audience",
      icon: UsersIcon,
      label: "Audience",
      subNav: {
        homeHref: "/admin/audience/contacts",
        groups: [
          {
            label: "People",
            items: [
              { label: "Contacts", href: "/admin/audience/contacts", icon: UsersIcon },
              { label: "Segments", href: "/admin/audience/segments", icon: TagIcon },
              { label: "Leads", href: "/admin/audience/leads", icon: UserCircleIcon },
              { label: "Influencers", href: "/admin/audience/influencers", icon: SparkleIcon },
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
            label: "Workspace",
            items: [
              { label: "General", href: "/admin/settings", icon: GearSixIcon },
              { label: "Team", href: "/admin/settings/team", icon: UserIcon },
              { label: "Notifications", href: "/admin/settings/notifications", icon: BellIcon },
              { label: "Billing", href: "/admin/settings/billing", icon: CurrencyDollarIcon },
            ],
          },
        ],
      },
    },
  ],
};
