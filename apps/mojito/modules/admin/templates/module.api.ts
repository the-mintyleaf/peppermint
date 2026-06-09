import { v4 as uuidv4 } from "uuid";

export type SlotType = "text" | "image_url" | "color" | "number";
export type PlatformFormat = "instagram_square" | "instagram_story" | "linkedin" | "twitter" | "generic";

export interface Slot {
  name: string;
  type: SlotType;
  label: string;
  required: boolean;
  placeholder?: string;
  maxChars?: number;
}

export interface Template extends Record<string, unknown> {
  id: string;
  name: string;
  description?: string;
  platform: PlatformFormat;
  width: number;
  height: number;
  html: string;
  slots: Slot[];
  thumbnailUrl?: string;
  updatedAt: string;
}

export const PLATFORM_DIMENSIONS: Record<PlatformFormat, { width: number; height: number }> = {
  instagram_square: { width: 1080, height: 1080 },
  instagram_story: { width: 1080, height: 1920 },
  linkedin: { width: 1200, height: 627 },
  twitter: { width: 1200, height: 675 },
  generic: { width: 1200, height: 630 },
};

export const PLATFORM_LABELS: Record<PlatformFormat, string> = {
  instagram_square: "Instagram Square",
  instagram_story: "Instagram Story",
  linkedin: "LinkedIn",
  twitter: "Twitter / X",
  generic: "Generic",
};

let mockTemplates: Template[] = [
  {
    id: "tmpl_1",
    name: "Instagram Square v2",
    description: "Clean branded square post for Instagram",
    platform: "instagram_square",
    width: 1080,
    height: 1080,
    html: `<div style="position:relative;width:1080px;height:1080px"><div data-slot="headline" style="position:absolute;left:80px;top:200px;font-size:64px;font-weight:700">{{headline}}</div></div>`,
    slots: [
      { name: "headline", type: "text", label: "Headline", required: true, placeholder: "Your headline here", maxChars: 80 },
      { name: "cta", type: "text", label: "Call to Action", required: false, placeholder: "Shop now" },
    ],
    thumbnailUrl: "https://placehold.co/1080x1080?text=Instagram+Square",
    updatedAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
  },
  {
    id: "tmpl_2",
    name: "LinkedIn Banner",
    description: "Professional article banner for LinkedIn",
    platform: "linkedin",
    width: 1200,
    height: 627,
    html: `<div style="position:relative;width:1200px;height:627px"><div data-slot="title" style="position:absolute;left:60px;top:180px;font-size:48px;font-weight:700">{{title}}</div></div>`,
    slots: [
      { name: "title", type: "text", label: "Article Title", required: true, placeholder: "Article title" },
      { name: "author", type: "text", label: "Author", required: false, placeholder: "Author name" },
    ],
    thumbnailUrl: "https://placehold.co/1200x627?text=LinkedIn+Banner",
    updatedAt: new Date(Date.now() - 5 * 86_400_000).toISOString(),
  },
  {
    id: "tmpl_3",
    name: "Twitter Card",
    description: "Eye-catching card for Twitter posts",
    platform: "twitter",
    width: 1200,
    height: 675,
    html: `<div style="position:relative;width:1200px;height:675px"><div data-slot="message" style="position:absolute;left:60px;top:150px;font-size:42px">{{message}}</div></div>`,
    slots: [
      { name: "message", type: "text", label: "Message", required: true, placeholder: "Tweet content", maxChars: 140 },
    ],
    thumbnailUrl: "https://placehold.co/1200x675?text=Twitter+Card",
    updatedAt: new Date(Date.now() - 1 * 86_400_000).toISOString(),
  },
];

export interface TemplatesResponse {
  data: Template[];
  meta: { total: number };
}

export async function fetchTemplates(): Promise<TemplatesResponse> {
  await new Promise((r) => setTimeout(r, 300));
  return { data: [...mockTemplates], meta: { total: mockTemplates.length } };
}

export async function fetchTemplate(id: string): Promise<Template> {
  await new Promise((r) => setTimeout(r, 200));
  const found = mockTemplates.find((t) => t.id === id);
  if (!found) throw new Error("Template not found");
  return { ...found };
}

export async function createTemplate(data: Partial<Template>): Promise<Template> {
  await new Promise((r) => setTimeout(r, 400));
  const newTemplate: Template = {
    id: uuidv4(),
    name: data.name ?? "Untitled Template",
    description: data.description,
    platform: data.platform ?? "generic",
    width: data.width ?? 1200,
    height: data.height ?? 630,
    html: data.html ?? "",
    slots: data.slots ?? [],
    thumbnailUrl: `https://placehold.co/${data.width ?? 1200}x${data.height ?? 630}?text=New+Template`,
    updatedAt: new Date().toISOString(),
  };
  mockTemplates = [newTemplate, ...mockTemplates];
  return newTemplate;
}

export async function updateTemplate(id: string, data: Partial<Template>): Promise<Template> {
  await new Promise((r) => setTimeout(r, 400));
  const index = mockTemplates.findIndex((t) => t.id === id);
  if (index === -1) throw new Error("Template not found");
  const updated = { ...mockTemplates[index], ...data, id, updatedAt: new Date().toISOString() };
  mockTemplates[index] = updated;
  return updated;
}

export async function deleteTemplate(id: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 300));
  mockTemplates = mockTemplates.filter((t) => t.id !== id);
}

export async function duplicateTemplate(id: string): Promise<Template> {
  const original = await fetchTemplate(id);
  return createTemplate({ ...original, name: `Copy of ${original.name}`, id: undefined });
}

export async function fetchAutomationsForTemplate(
  templateId: string
): Promise<{ id: string; name: string; status: string }[]> {
  await new Promise((r) => setTimeout(r, 200));
  if (templateId === "tmpl_1") {
    return [
      { id: "auto_1", name: "Weekly Instagram Post", status: "scheduled" },
    ];
  }
  return [];
}
