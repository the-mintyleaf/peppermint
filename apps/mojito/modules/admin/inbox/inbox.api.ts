import { delay, paginate, USE_MOCK } from "../shared/mock.utils";
import type { Conversation, ThreadMessage } from "../shared/entities.types";

// TODO(backend): replace with real API
const CHANNELS = ["ch_1", "ch_2", "ch_3", "ch_4"];
const PLATFORM_FOR_CHANNEL: Record<string, string> = {
  ch_1: "instagram",
  ch_2: "x",
  ch_3: "linkedin",
  ch_4: "tiktok",
};

const SAMPLE_AUTHORS = [
  "sarah_m", "dev_john", "pixel_art99", "techblogger", "johndoe_real",
  "marketing_pro", "insta_queen", "code_wizard", "design_daily", "growth_hacker",
];

const CONV_TYPES: Conversation["type"][] = ["comment", "mention", "dm", "review"];
const STATUSES: Conversation["status"][] = ["open", "assigned", "done"];

function makeThread(count: number): ThreadMessage[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `msg_${i}`,
    type: i % 5 === 4 ? ("internal_note" as const) : i % 2 === 0 ? ("comment" as const) : ("reply" as const),
    author: i % 2 === 0 ? SAMPLE_AUTHORS[i % SAMPLE_AUTHORS.length] : "You",
    text: [
      "Thanks for reaching out! We'll look into this.",
      "Can you share more details about your issue?",
      "We've fixed this in the latest release.",
      "Great feedback — we'll share with the team.",
      "Internal note: escalate to product",
    ][i % 5],
    createdAt: new Date(Date.now() - (count - i) * 3600_000),
  }));
}

let conversations: Conversation[] = Array.from({ length: 25 }, (_, i) => {
  const channelId = CHANNELS[i % CHANNELS.length];
  const type = CONV_TYPES[i % CONV_TYPES.length];
  const status = i < 10 ? "open" : i < 18 ? "assigned" : "done";
  return {
    id: `conv_${i + 1}`,
    channelId,
    platform: PLATFORM_FOR_CHANNEL[channelId] as Conversation["platform"],
    type,
    author: SAMPLE_AUTHORS[i % SAMPLE_AUTHORS.length],
    text: [
      "Hey, I noticed your latest post was amazing!",
      "Can you help me with this issue?",
      "Love your content, keep it up!",
      "I think there's a bug in your app.",
      "When is the next update coming?",
      "This is exactly what I needed, thank you!",
      "Disappointed with recent changes.",
      "How do I contact support?",
      "Your team responded so fast, thanks!",
      "Feature request: dark mode please",
    ][i % 10],
    status: status as Conversation["status"],
    assignedTo: status === "assigned" ? "You" : undefined,
    threadMessages: makeThread(i % 4 + 1),
    createdAt: new Date(Date.now() - i * 2 * 3600_000),
  };
});

export interface InboxFilters {
  status?: Conversation["status"];
  type?: Conversation["type"];
  channelId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function fetchConversations(filters: InboxFilters = {}) {
  await delay();
  let items = [...conversations];
  if (filters.status) items = items.filter((c) => c.status === filters.status);
  if (filters.type) items = items.filter((c) => c.type === filters.type);
  if (filters.channelId) items = items.filter((c) => c.channelId === filters.channelId);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    items = items.filter(
      (c) => c.author.toLowerCase().includes(q) || c.text.toLowerCase().includes(q)
    );
  }
  return paginate(items, filters.page ?? 1, filters.pageSize ?? 15);
}

export async function fetchConversation(id: string): Promise<Conversation | null> {
  await delay();
  return conversations.find((c) => c.id === id) ?? null;
}

export async function assignConversation(id: string, assignedTo: string): Promise<Conversation> {
  await delay();
  const idx = conversations.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error("Not found");
  conversations[idx] = { ...conversations[idx], assignedTo, status: "assigned" };
  return conversations[idx];
}

export async function resolveConversation(id: string): Promise<Conversation> {
  await delay();
  const idx = conversations.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error("Not found");
  conversations[idx] = { ...conversations[idx], status: "done" };
  return conversations[idx];
}

export async function reopenConversation(id: string): Promise<Conversation> {
  await delay();
  const idx = conversations.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error("Not found");
  conversations[idx] = { ...conversations[idx], status: "open", assignedTo: undefined };
  return conversations[idx];
}

export async function replyToConversation(
  id: string,
  text: string,
  type: ThreadMessage["type"] = "reply"
): Promise<Conversation> {
  await delay();
  const idx = conversations.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error("Not found");
  const newMsg: ThreadMessage = {
    id: `msg_${Date.now()}`,
    type,
    author: "You",
    text,
    createdAt: new Date(),
  };
  conversations[idx] = {
    ...conversations[idx],
    threadMessages: [...conversations[idx].threadMessages, newMsg],
  };
  return conversations[idx];
} // TODO(backend): POST /conversations/:id/reply
