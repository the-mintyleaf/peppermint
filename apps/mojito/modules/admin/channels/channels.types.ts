export type ChannelPlatform =
  | "instagram"
  | "twitter"
  | "facebook"
  | "linkedin"
  | "tiktok"
  | "youtube"
  | "pinterest";

export type ChannelStatus = "connected" | "disconnected" | "expired" | "error";

export interface Channel extends Record<string, unknown> {
  id: string;
  platform: ChannelPlatform;
  handle: string;
  displayName: string;
  url: string;
  status: ChannelStatus;
  connectedAt: string;
  followersCount?: number;
  notes?: string;
}

export interface ChannelsFetchResponse {
  data: Channel[];
  meta: { total: number; page: number; pageSize: number };
}
