import type { QueryParams } from "@peppermint/admin";
import type { Channel, ChannelsFetchResponse } from "./channels.types";
import { v4 as uuidv4 } from "uuid";

let mockChannels: Channel[] = [
  {
    id: "1",
    platform: "instagram",
    handle: "@mojito_brand",
    displayName: "Mojito Brand",
    url: "https://instagram.com/mojito_brand",
    status: "connected",
    connectedAt: "2025-01-15",
    followersCount: 12400,
    notes: "Main brand account",
  },
  {
    id: "2",
    platform: "twitter",
    handle: "@mojito_official",
    displayName: "Mojito Official",
    url: "https://x.com/mojito_official",
    status: "connected",
    connectedAt: "2025-02-10",
    followersCount: 8300,
  },
  {
    id: "3",
    platform: "facebook",
    handle: "MojitoBrandPage",
    displayName: "Mojito Brand Page",
    url: "https://facebook.com/MojitoBrandPage",
    status: "expired",
    connectedAt: "2024-11-01",
    followersCount: 5200,
    notes: "Token expired — needs reconnection",
  },
  {
    id: "4",
    platform: "linkedin",
    handle: "mojito-company",
    displayName: "Mojito Company",
    url: "https://linkedin.com/company/mojito-company",
    status: "disconnected",
    connectedAt: "2024-09-20",
    followersCount: 1800,
  },
  {
    id: "5",
    platform: "tiktok",
    handle: "@mojito.brand",
    displayName: "Mojito Brand TikTok",
    url: "https://tiktok.com/@mojito.brand",
    status: "connected",
    connectedAt: "2025-03-05",
    followersCount: 31000,
  },
  {
    id: "6",
    platform: "youtube",
    handle: "@MojitoChannel",
    displayName: "Mojito Channel",
    url: "https://youtube.com/@MojitoChannel",
    status: "error",
    connectedAt: "2024-12-01",
    followersCount: 4500,
    notes: "API quota exceeded",
  },
];

export async function fetchChannels(params?: QueryParams): Promise<ChannelsFetchResponse> {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const search = params?.search || "";
  const status = params?.filters?.status as string | undefined;

  let filtered = mockChannels;

  if (search) {
    filtered = filtered.filter(
      (c) =>
        c.handle.toLowerCase().includes(search.toLowerCase()) ||
        c.displayName.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (status) {
    filtered = filtered.filter((c) => c.status === status);
  }

  const start = (page - 1) * pageSize;
  const paginatedData = filtered.slice(start, start + pageSize);

  return {
    data: paginatedData,
    meta: { total: filtered.length, page, pageSize },
  };
}

export async function createChannel(values: Partial<Channel>): Promise<Channel> {
  const newChannel: Channel = {
    id: uuidv4(),
    platform: values.platform || "instagram",
    handle: values.handle || "",
    displayName: values.displayName || "",
    url: values.url || "",
    status: values.status || "disconnected",
    connectedAt: values.connectedAt || new Date().toISOString().split("T")[0],
    followersCount: values.followersCount,
    notes: values.notes,
  };
  mockChannels = [newChannel, ...mockChannels];
  return newChannel;
}

export async function updateChannel(id: string, values: Partial<Channel>): Promise<Channel> {
  const index = mockChannels.findIndex((c) => c.id === id);
  if (index === -1) throw new Error("Channel not found");
  const updated = { ...mockChannels[index], ...values, id };
  mockChannels[index] = updated;
  return updated;
}

export async function deleteChannel(id: string): Promise<void> {
  mockChannels = mockChannels.filter((c) => c.id !== id);
}

export async function connectChannel(platform: Channel["platform"]): Promise<Channel> {
  await new Promise((r) => setTimeout(r, 1500)); // simulate OAuth delay
  const newChannel: Channel = {
    id: uuidv4(),
    platform,
    handle: `@mojito_${platform}`,
    displayName: `Mojito ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
    url: `https://${platform}.com/mojito`,
    status: "connected",
    connectedAt: new Date().toISOString().split("T")[0],
    followersCount: 0,
  };
  mockChannels = [newChannel, ...mockChannels];
  return newChannel;
}

export async function disconnectChannel(id: string): Promise<Channel> {
  return updateChannel(id, { status: "disconnected" });
}

export async function reconnectChannel(id: string): Promise<Channel> {
  await new Promise((r) => setTimeout(r, 1500));
  return updateChannel(id, { status: "connected" });
}

export async function updateChannelSettings(
  id: string,
  settings: {
    timezone?: string;
    signature?: string;
    defaultFirstComment?: string;
  }
): Promise<Channel> {
  return updateChannel(id, settings as Partial<Channel>);
}

// TODO(backend): replace mock OAuth with real OAuth flow
