import { v4 as uuidv4 } from "uuid";

export interface ContentItem extends Record<string, unknown> {
  id: string;
  automationId: string;
  automationName: string;
  templateId: string;
  templateName: string;
  platform: string;
  status: "generated" | "approved" | "published" | "failed";
  generatedAt: string;
  publishedAt?: string;
  previewUrl: string;
  slotValues: Record<string, string>;
  runId: string;
}

export interface ContentListResponse {
  data: ContentItem[];
  meta: { total: number; page: number; pageSize: number };
}

export interface ContentFilter {
  automationId?: string;
  platform?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

const PLATFORMS = ["instagram", "twitter", "linkedin", "tiktok"];
const STATUSES: ContentItem["status"][] = ["generated", "approved", "published", "failed"];
const AUTOMATIONS = [
  { id: "auto_1", name: "Weekly Instagram Post" },
  { id: "auto_2", name: "LinkedIn Article" },
  { id: "auto_3", name: "Twitter Daily" },
];
const TEMPLATES = [
  { id: "tmpl_1", name: "Instagram Square v2" },
  { id: "tmpl_2", name: "LinkedIn Banner" },
  { id: "tmpl_3", name: "Twitter Card" },
];

let mockItems: ContentItem[] = Array.from({ length: 48 }, (_, i) => {
  const auto = AUTOMATIONS[i % AUTOMATIONS.length];
  const tmpl = TEMPLATES[i % TEMPLATES.length];
  const platform = PLATFORMS[i % PLATFORMS.length];
  const status = STATUSES[i % STATUSES.length];
  return {
    id: uuidv4(),
    automationId: auto.id,
    automationName: auto.name,
    templateId: tmpl.id,
    templateName: tmpl.name,
    platform,
    status,
    generatedAt: new Date(Date.now() - i * 3_600_000).toISOString(),
    publishedAt: status === "published" ? new Date(Date.now() - i * 1_800_000).toISOString() : undefined,
    previewUrl: `https://placehold.co/600x600?text=${platform}+${i + 1}`,
    slotValues: {
      headline: `Sample headline ${i + 1}`,
      cta: "Learn more",
    },
    runId: `run_${i + 1}`,
  };
});

export async function fetchContentList(filter: ContentFilter = {}): Promise<ContentListResponse> {
  await new Promise((r) => setTimeout(r, 350));
  let results = [...mockItems];

  if (filter.automationId) results = results.filter((c) => c.automationId === filter.automationId);
  if (filter.platform) results = results.filter((c) => c.platform === filter.platform);
  if (filter.status) results = results.filter((c) => c.status === filter.status);

  const page = filter.page ?? 1;
  const limit = filter.limit ?? 24;
  const total = results.length;
  const paged = results.slice((page - 1) * limit, page * limit);

  return { data: paged, meta: { total, page, pageSize: limit } };
}

export async function fetchContentItem(id: string): Promise<ContentItem> {
  await new Promise((r) => setTimeout(r, 200));
  const item = mockItems.find((c) => c.id === id);
  if (!item) throw new Error("Content item not found");
  return item;
}

export async function approveContentItem(id: string): Promise<ContentItem> {
  await new Promise((r) => setTimeout(r, 300));
  const index = mockItems.findIndex((c) => c.id === id);
  if (index === -1) throw new Error("Content item not found");
  mockItems[index] = { ...mockItems[index], status: "approved" };
  return mockItems[index];
}
