import { delay, paginate, USE_MOCK } from "../shared/mock.utils";
import type { MediaAsset, MediaFolder } from "../shared/entities.types";

// TODO(backend): replace with real API

let folders: MediaFolder[] = [
  { id: "f_1", name: "Product Photos" },
  { id: "f_2", name: "Brand Assets", parentId: undefined },
  { id: "f_3", name: "Campaign Q4", parentId: "f_1" },
  { id: "f_4", name: "Social Templates" },
];

const SAMPLE_IMAGES = [
  "https://picsum.photos/seed/m1/400/400",
  "https://picsum.photos/seed/m2/400/300",
  "https://picsum.photos/seed/m3/600/400",
  "https://picsum.photos/seed/m4/400/600",
  "https://picsum.photos/seed/m5/800/400",
  "https://picsum.photos/seed/m6/400/400",
];

let assets: MediaAsset[] = Array.from({ length: 30 }, (_, i) => ({
  id: `media_${i + 1}`,
  kind: i % 5 === 4 ? "video" : "image",
  url: SAMPLE_IMAGES[i % SAMPLE_IMAGES.length],
  thumbnailUrl: SAMPLE_IMAGES[i % SAMPLE_IMAGES.length],
  alt: `Asset ${i + 1}`,
  width: 400 + (i % 3) * 200,
  height: 400 + (i % 2) * 200,
  durationSec: i % 5 === 4 ? 30 + i : undefined,
  tags: [`tag_${(i % 5) + 1}`, i % 2 === 0 ? "featured" : "draft"],
  folderId: folders[i % folders.length].id,
  createdAt: new Date(Date.now() - i * 4 * 3600_000),
}));

export interface MediaFilters {
  folderId?: string;
  kind?: "image" | "video";
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function fetchMedia(filters: MediaFilters = {}) {
  await delay();
  let items = [...assets];
  if (filters.folderId)
    items = items.filter((a) => a.folderId === filters.folderId);
  if (filters.kind) items = items.filter((a) => a.kind === filters.kind);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    items = items.filter(
      (a) =>
        a.alt.toLowerCase().includes(q) || a.tags.some((t) => t.includes(q)),
    );
  }
  return paginate(items, filters.page ?? 1, filters.pageSize ?? 20);
}

export async function fetchFolders(): Promise<MediaFolder[]> {
  await delay(100);
  return [...folders];
}

export async function createFolder(
  name: string,
  parentId?: string,
): Promise<MediaFolder> {
  await delay();
  const folder: MediaFolder = { id: `f_${Date.now()}`, name, parentId };
  folders.push(folder);
  return folder;
}

export async function deleteFolder(id: string): Promise<void> {
  await delay();
  folders = folders.filter((f) => f.id !== id);
}

export async function uploadMedia(
  file: File,
  folderId?: string,
): Promise<MediaAsset> {
  await delay(800);
  const url = URL.createObjectURL(file);
  const asset: MediaAsset = {
    id: `media_${Date.now()}`,
    kind: file.type.startsWith("video") ? "video" : "image",
    url,
    thumbnailUrl: url,
    alt: file.name.replace(/\.[^.]+$/, ""),
    width: 400,
    height: 400,
    tags: [],
    folderId,
    createdAt: new Date(),
  };
  assets.unshift(asset);
  return asset;
} // TODO(backend): POST /media/upload

export async function updateMedia(
  id: string,
  patch: Partial<Pick<MediaAsset, "alt" | "tags" | "folderId">>,
): Promise<MediaAsset> {
  await delay();
  const idx = assets.findIndex((a) => a.id === id);
  if (idx === -1) throw new Error("Not found");
  assets[idx] = { ...assets[idx], ...patch };
  return assets[idx];
}

export async function deleteMedia(id: string): Promise<void> {
  await delay();
  assets = assets.filter((a) => a.id !== id);
}

export async function bulkDeleteMedia(ids: string[]): Promise<void> {
  await delay();
  assets = assets.filter((a) => !ids.includes(a.id));
} // TODO(backend): DELETE /media/bulk
