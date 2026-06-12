import type { Platform } from "./domain.types";

export interface Channel {
  id: string;
  platform: Platform;
  handle: string;
  displayName: string;
  avatar?: string;
  url: string;
  status: "connected" | "disconnected" | "expired" | "error";
  connectedAt: Date;
  timezone: string;
  signature?: string;
  defaultFirstComment?: string;
  followersCount?: number;
  notes?: string;
}

export interface MediaAsset {
  id: string;
  kind: "image" | "video";
  url: string;
  thumbnailUrl?: string;
  alt: string;
  width: number;
  height: number;
  durationSec?: number;
  tags: string[];
  folderId?: string;
  createdAt: Date;
}

export interface MediaFolder {
  id: string;
  name: string;
  parentId?: string;
}

export interface WorkflowNode {
  id: string;
  label: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

export interface Workflow {
  id: string;
  name: string;
  status: "draft" | "active" | "paused" | "archived";
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  schedule?: {
    trigger: "schedule" | "webhook" | "manual";
    cron?: string;
    nextRunAt?: Date;
  };
  lastRunAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AutomationStep {
  id: string;
  label: string;
  status: "pending" | "running" | "succeeded" | "failed" | "skipped";
  log?: string;
  startedAt?: Date;
  finishedAt?: Date;
}

export interface AutomationRun {
  id: string;
  workflowId: string;
  status: "waiting_review" | "running" | "succeeded" | "partial" | "failed";
  steps: AutomationStep[];
  producedContentIds: string[];
  startedAt: Date;
  finishedAt?: Date;
}

export interface ThreadMessage {
  id: string;
  type: "comment" | "reply" | "internal_note";
  author: string;
  text: string;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  channelId: string;
  platform: Platform;
  type: "comment" | "mention" | "dm" | "review";
  author: string;
  text: string;
  status: "open" | "assigned" | "done";
  assignedTo?: string;
  threadMessages: ThreadMessage[];
  createdAt: Date;
}

export interface InboxMessage extends ThreadMessage {}

export interface Mention {
  id: string;
  source: string;
  platform: Platform;
  author: string;
  text: string;
  url: string;
  sentiment: "positive" | "neutral" | "negative";
  reach: number;
  createdAt: Date;
}

export interface Keyword {
  id: string;
  term: string;
  kind: "keyword" | "hashtag";
  volumeSeries: Array<{ date: Date; value: number }>;
}

export interface Competitor {
  id: string;
  handle: string;
  platform: Platform;
  volumeSeries: Array<{ date: Date; value: number }>;
}

export interface Alert {
  id: string;
  type: "volume_spike" | "crisis" | "keyword_mention";
  text: string;
  read: boolean;
  triggeredAt: Date;
}

export interface AnalyticsPoint {
  date: Date;
  value: number;
}

export interface AnalyticsSeries {
  metric: string;
  granularity: "daily" | "weekly" | "monthly";
  points: AnalyticsPoint[];
  perPlatform?: Record<Platform, AnalyticsPoint[]>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "admin" | "editor" | "viewer";
  status: "active" | "inactive" | "pending";
}

export interface TeamMember extends User {
  joinedAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  logo?: string;
  timezone: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  text: string;
  read: boolean;
  createdAt: Date;
  link?: string;
}

export interface Integration {
  id: string;
  name: string;
  category: string;
  connected: boolean;
  logo?: string;
}

export interface LinkInBioLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
  style?: Record<string, unknown>;
}

export interface LinkInBioPage {
  id: string;
  slug: string;
  links: LinkInBioLink[];
  theme: string;
  clickStats: Record<string, number>;
}

export interface BrandKitLogo {
  id: string;
  type: "primary" | "secondary";
  url: string;
}

export interface BrandKitColor {
  id: string;
  name: string;
  value: string;
}

export interface BrandKitFont {
  id: string;
  family: string;
  weights: number[];
}

export interface BrandKit {
  id: string;
  logos: BrandKitLogo[];
  palette: BrandKitColor[];
  fonts: BrandKitFont[];
  watermark?: {
    url: string;
    position: "bottom-left" | "bottom-right" | "center";
  };
}

export interface ReportSection {
  id: string;
  name: string;
  enabled: boolean;
}

export interface Report {
  id: string;
  name: string;
  range: {
    from: Date;
    to: Date;
  };
  sections: ReportSection[];
  schedule?: {
    frequency: "daily" | "weekly" | "monthly";
    recipients: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface QueueSlot {
  id: string;
  channelId: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  time: string;
  timezone: string;
}
