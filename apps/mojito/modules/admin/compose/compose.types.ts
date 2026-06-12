import type { Platform, ContentItem, ChannelVariant, ScheduleInfo, MediaRef } from "../shared/domain.types";

export interface VariantEditorState {
  platform: Platform;
  caption: string;
  format: ChannelVariant["format"];
  characterCount: number;
  isValid: boolean;
  errors: string[];
}

export interface AiPanelState {
  open: boolean;
  loading: boolean;
  lastResult?: string;
}

export interface ComposeDraft {
  title: string;
  selectedChannelIds: string[];
  variants: Record<Platform, Partial<ChannelVariant>>;
  globalCaption: string;
  perVariantCustomize: boolean;
  schedule: Partial<ScheduleInfo>;
  mediaRefs: MediaRef[];
}

export interface ComposeState {
  draft: ComposeDraft;
  aiPanel: AiPanelState;
  previewPlatform: Platform;
  variantEditorStates: Record<Platform, VariantEditorState>;
}

export const PLATFORM_CHAR_LIMITS: Record<Platform, number> = {
  instagram: 2200,
  facebook: 63206,
  x: 280,
  linkedin: 3000,
  tiktok: 2200,
  youtube: 5000,
  threads: 500,
  pinterest: 500,
};

export const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  x: "X (Twitter)",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  youtube: "YouTube",
  threads: "Threads",
  pinterest: "Pinterest",
};
