export type Platform =
  | "instagram"
  | "facebook"
  | "x"
  | "linkedin"
  | "tiktok"
  | "youtube"
  | "threads"
  | "pinterest";

export type ContentStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "scheduled"
  | "publishing"
  | "published"
  | "failed";

export type ContentSource = "manual" | "agent";

export type MediaKind =
  | "image"
  | "video"
  | "carousel"
  | "story"
  | "reel"
  | "short";

export interface MediaRef {
  id: string;
  url: string;
  kind: MediaKind;
  alt: string;
  width?: number;
  height?: number;
}

export interface ThreadPart {
  text: string;
  media?: MediaRef[];
}

export interface PollOptions {
  options: string[];
  durationHours: number;
}

export interface ChannelVariant {
  platform: Platform;
  channelId: string;
  enabled: boolean;
  format:
    | "single"
    | "carousel"
    | "thread"
    | "story"
    | "reel"
    | "short"
    | "poll";
  caption: string;
  media: MediaRef[];
  hashtags: string[];
  mentions: string[];
  firstComment?: string;
  link?: string;
  thread?: ThreadPart[];
  poll?: PollOptions;
}

export interface ScheduleInfo {
  scheduledAt?: Date;
  timezone: string;
  queueSlotId?: string;
  publishedAt?: Date;
}

export interface ContentAnalyticsSummary {
  impressions: number;
  reach: number;
  engagements: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  saves: number;
  perPlatform?: Record<Platform, Partial<ContentAnalyticsSummary>>;
}

export interface ReviewInfo {
  approvedBy?: string;
  rejectedBy?: string;
  decision: "approved" | "rejected" | "pending";
  notes?: string;
  decidedAt?: Date;
}

export interface ContentItem {
  id: string;
  title: string;
  status: ContentStatus;
  source: ContentSource;
  variants: ChannelVariant[];
  schedule: ScheduleInfo;
  analytics?: ContentAnalyticsSummary;
  review?: ReviewInfo;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
