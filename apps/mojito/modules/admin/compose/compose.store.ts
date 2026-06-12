"use client";

import { create } from "zustand";
import type { Platform, ChannelVariant, ScheduleInfo, MediaRef } from "../shared/domain.types";
import type { ComposeDraft, ComposeState, VariantEditorState, AiPanelState } from "./compose.types";
import { PLATFORM_CHAR_LIMITS } from "./compose.types";

function defaultVariantState(platform: Platform): VariantEditorState {
  return {
    platform,
    caption: "",
    format: "single",
    characterCount: 0,
    isValid: true,
    errors: [],
  };
}

function defaultDraft(): ComposeDraft {
  return {
    title: "",
    selectedChannelIds: [],
    variants: {} as Record<Platform, Partial<ChannelVariant>>,
    globalCaption: "",
    perVariantCustomize: false,
    schedule: { timezone: "UTC" },
    mediaRefs: [],
  };
}

interface ComposeActions {
  setTitle: (title: string) => void;
  setGlobalCaption: (text: string) => void;
  setCaption: (platform: Platform, text: string) => void;
  toggleChannel: (channelId: string, platform: Platform) => void;
  toggleCustomize: () => void;
  setFormat: (platform: Platform, format: ChannelVariant["format"]) => void;
  setSchedule: (info: Partial<ScheduleInfo>) => void;
  addMedia: (ref: MediaRef) => void;
  removeMedia: (id: string) => void;
  openAiPanel: () => void;
  closeAiPanel: () => void;
  setAiLoading: (loading: boolean) => void;
  setPreview: (platform: Platform) => void;
  reset: () => void;
}

export const useComposeStore = create<ComposeState & ComposeActions>((set) => ({
  draft: defaultDraft(),
  aiPanel: { open: false, loading: false },
  previewPlatform: "instagram",
  variantEditorStates: {} as Record<Platform, VariantEditorState>,

  setTitle: (title) =>
    set((s) => ({ draft: { ...s.draft, title } })),

  setGlobalCaption: (text) =>
    set((s) => ({ draft: { ...s.draft, globalCaption: text } })),

  setCaption: (platform, text) =>
    set((s) => {
      const limit = PLATFORM_CHAR_LIMITS[platform];
      const prev = s.variantEditorStates[platform] ?? defaultVariantState(platform);
      return {
        variantEditorStates: {
          ...s.variantEditorStates,
          [platform]: {
            ...prev,
            caption: text,
            characterCount: text.length,
            errors: text.length > limit ? [`Exceeds ${platform} limit of ${limit} characters`] : [],
            isValid: text.length <= limit,
          },
        },
        draft: {
          ...s.draft,
          variants: {
            ...s.draft.variants,
            [platform]: { ...(s.draft.variants[platform] ?? {}), caption: text },
          },
        },
      };
    }),

  toggleChannel: (channelId, platform) =>
    set((s) => {
      const ids = s.draft.selectedChannelIds;
      const selected = ids.includes(channelId)
        ? ids.filter((id) => id !== channelId)
        : [...ids, channelId];

      const variantEditorStates = { ...s.variantEditorStates };
      if (!variantEditorStates[platform]) {
        variantEditorStates[platform] = defaultVariantState(platform);
      }

      return { draft: { ...s.draft, selectedChannelIds: selected }, variantEditorStates };
    }),

  toggleCustomize: () =>
    set((s) => ({ draft: { ...s.draft, perVariantCustomize: !s.draft.perVariantCustomize } })),

  setFormat: (platform, format) =>
    set((s) => ({
      draft: {
        ...s.draft,
        variants: {
          ...s.draft.variants,
          [platform]: { ...(s.draft.variants[platform] ?? {}), format },
        },
      },
      variantEditorStates: {
        ...s.variantEditorStates,
        [platform]: { ...(s.variantEditorStates[platform] ?? defaultVariantState(platform)), format },
      },
    })),

  setSchedule: (info) =>
    set((s) => ({
      draft: { ...s.draft, schedule: { ...s.draft.schedule, ...info } },
    })),

  addMedia: (ref) =>
    set((s) => ({ draft: { ...s.draft, mediaRefs: [...s.draft.mediaRefs, ref] } })),

  removeMedia: (id) =>
    set((s) => ({ draft: { ...s.draft, mediaRefs: s.draft.mediaRefs.filter((m) => m.id !== id) } })),

  openAiPanel: () => set({ aiPanel: { open: true, loading: false } }),
  closeAiPanel: () => set({ aiPanel: { open: false, loading: false } }),
  setAiLoading: (loading) =>
    set((s) => ({ aiPanel: { ...s.aiPanel, loading } })),

  setPreview: (platform) => set({ previewPlatform: platform }),

  reset: () =>
    set({
      draft: defaultDraft(),
      aiPanel: { open: false, loading: false },
      previewPlatform: "instagram",
      variantEditorStates: {} as Record<Platform, VariantEditorState>,
    }),
}));
