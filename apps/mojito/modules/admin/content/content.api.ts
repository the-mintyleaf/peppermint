import { delay, paginate, PaginatedResponse } from "../shared/mock.utils";
import type { ContentItem, ContentStatus, Platform, ContentSource, ChannelVariant, MediaRef } from "../shared/domain.types";
import { v4 as uuidv4 } from "uuid";

const MOCK_PLATFORMS: Platform[] = [
  "instagram",
  "facebook",
  "x",
  "linkedin",
  "tiktok",
  "youtube",
  "threads",
  "pinterest",
];

const MOCK_CAPTIONS = [
  "Just launched something new! 🚀",
  "Can't wait to share this with you",
  "Check out our latest update",
  "Excited about this project",
  "Behind the scenes magic ✨",
  "New features coming soon",
  "Thanks for the support",
  "What do you think about this?",
  "Join us on this journey",
  "Latest insights from our team",
];

const MOCK_HASHTAGS = [
  "#launch",
  "#newfeatures",
  "#update",
  "#excited",
  "#tech",
  "#innovation",
  "#startup",
  "#buildinginpublic",
];

function createMockMediaRef(): MediaRef {
  return {
    id: uuidv4(),
    url: `https://via.placeholder.com/1200x800?text=Social+Content`,
    kind: "image",
    alt: "Social media content",
    width: 1200,
    height: 800,
  };
}

function createMockChannelVariant(platform: Platform): ChannelVariant {
  return {
    platform,
    channelId: `channel_${platform}_${Math.random().toString(36).substr(2, 9)}`,
    enabled: true,
    format: "single",
    caption: MOCK_CAPTIONS[Math.floor(Math.random() * MOCK_CAPTIONS.length)],
    media: [createMockMediaRef()],
    hashtags: MOCK_HASHTAGS.slice(0, Math.random() > 0.5 ? 3 : 2),
    mentions: [],
    firstComment: undefined,
  };
}

function createMockContentItem(index: number): ContentItem {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 90);
  const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

  const statuses: ContentStatus[] = [
    "draft",
    "pending_review",
    "approved",
    "scheduled",
    "publishing",
    "published",
    "failed",
  ];
  const sources: ContentSource[] = ["manual", "agent"];
  const platformsForItem = MOCK_PLATFORMS.slice(
    0,
    Math.floor(Math.random() * 4) + 1
  );

  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const scheduledAt =
    status === "scheduled"
      ? new Date(now.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000)
      : undefined;

  return {
    id: `content_${index}_${uuidv4()}`,
    title: `Content ${index}: ${MOCK_CAPTIONS[index % MOCK_CAPTIONS.length]}`,
    status,
    source: sources[Math.floor(Math.random() * sources.length)],
    variants: platformsForItem.map((p) => createMockChannelVariant(p)),
    schedule: {
      timezone: "UTC",
      scheduledAt,
    },
    analytics: {
      impressions: Math.floor(Math.random() * 10000),
      reach: Math.floor(Math.random() * 5000),
      engagements: Math.floor(Math.random() * 500),
      likes: Math.floor(Math.random() * 300),
      comments: Math.floor(Math.random() * 50),
      shares: Math.floor(Math.random() * 20),
      clicks: Math.floor(Math.random() * 100),
      saves: Math.floor(Math.random() * 80),
    },
    review:
      status === "pending_review"
        ? { decision: "pending" }
        : status === "approved"
          ? {
              decision: "approved",
              approvedBy: "user_123",
              decidedAt: new Date(createdAt.getTime() + 2 * 60 * 60 * 1000),
            }
          : undefined,
    createdAt,
    updatedAt: createdAt,
    createdBy: "user_123",
  };
}

let contentStore: ContentItem[] = Array.from(
  { length: 40 },
  (_, i) => createMockContentItem(i)
);

export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  range?: { from: Date; to: Date };
  status?: ContentStatus;
  source?: ContentSource;
  platform?: Platform;
}

export async function fetchContentItems(
  params?: QueryParams
): Promise<PaginatedResponse<ContentItem>> {
  await delay(300);

  let filtered = contentStore;

  if (params?.status) {
    filtered = filtered.filter((item) => item.status === params.status);
  }

  if (params?.source) {
    filtered = filtered.filter((item) => item.source === params.source);
  }

  if (params?.platform) {
    filtered = filtered.filter((item) =>
      item.variants.some((v) => v.platform === params.platform)
    );
  }

  if (params?.range) {
    filtered = filtered.filter(
      (item) =>
        item.createdAt >= params.range!.from &&
        item.createdAt <= params.range!.to
    );
  }

  if (params?.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.title.toLowerCase().includes(searchLower) ||
        item.variants.some((v) =>
          v.caption.toLowerCase().includes(searchLower)
        )
    );
  }

  filtered.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  return paginate(
    filtered,
    params?.page || 1,
    params?.pageSize || 10
  );
}

export async function fetchContentItem(id: string): Promise<ContentItem> {
  await delay(200);
  const item = contentStore.find((c) => c.id === id);
  if (!item) throw new Error(`Content item ${id} not found`);
  return item;
}

export async function createContentItem(
  data: Omit<ContentItem, "id" | "createdAt" | "updatedAt" | "analytics">
): Promise<ContentItem> {
  await delay(500);

  const newItem: ContentItem = {
    ...data,
    id: `content_${uuidv4()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    analytics: {
      impressions: 0,
      reach: 0,
      engagements: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      clicks: 0,
      saves: 0,
    },
  };

  contentStore.push(newItem);
  return newItem;
}

export async function updateContentItem(
  id: string,
  data: Partial<ContentItem>
): Promise<ContentItem> {
  await delay(500);

  const index = contentStore.findIndex((c) => c.id === id);
  if (index === -1) throw new Error(`Content item ${id} not found`);

  const updated: ContentItem = {
    ...contentStore[index],
    ...data,
    id,
    createdAt: contentStore[index].createdAt,
    updatedAt: new Date(),
  };

  contentStore[index] = updated;
  return updated;
}

export async function deleteContentItem(id: string): Promise<void> {
  await delay(400);

  const index = contentStore.findIndex((c) => c.id === id);
  if (index === -1) throw new Error(`Content item ${id} not found`);

  contentStore.splice(index, 1);
}

export async function scheduleContentItem(
  id: string,
  scheduledAt: Date,
  timezone: string
): Promise<ContentItem> {
  await delay(300);

  return updateContentItem(id, {
    status: "scheduled",
    schedule: {
      ...contentStore.find((c) => c.id === id)?.schedule,
      scheduledAt,
      timezone,
    },
  });
}

export async function publishNowContentItem(id: string): Promise<ContentItem> {
  await delay(300);

  let item = await updateContentItem(id, { status: "publishing" });

  await delay(1500);

  item = await updateContentItem(id, {
    status: "published",
    schedule: {
      ...item.schedule,
      publishedAt: new Date(),
    },
  });

  return item;
}

export async function approveContentItem(
  id: string,
  notes?: string
): Promise<ContentItem> {
  await delay(300);

  return updateContentItem(id, {
    status: "approved",
    review: {
      decision: "approved",
      approvedBy: "user_123",
      notes,
      decidedAt: new Date(),
    },
  });
}

export async function rejectContentItem(
  id: string,
  notes: string
): Promise<ContentItem> {
  await delay(300);

  return updateContentItem(id, {
    status: "draft",
    review: {
      decision: "rejected",
      rejectedBy: "user_123",
      notes,
      decidedAt: new Date(),
    },
  });
}

export async function duplicateContentItem(id: string): Promise<ContentItem> {
  await delay(400);

  const original = contentStore.find((c) => c.id === id);
  if (!original) throw new Error(`Content item ${id} not found`);

  const duplicate: ContentItem = {
    ...original,
    id: `content_${uuidv4()}`,
    title: `${original.title} (Copy)`,
    status: "draft",
    createdAt: new Date(),
    updatedAt: new Date(),
    review: undefined,
    schedule: {
      ...original.schedule,
      scheduledAt: undefined,
      publishedAt: undefined,
    },
  };

  contentStore.push(duplicate);
  return duplicate;
}

// TODO(backend): replace in-memory store with real API adapter
