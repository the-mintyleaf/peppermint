import { delay, paginate } from "../shared/mock.utils";
import type { QueueSlot } from "../shared/entities.types";
import type { ContentItem } from "../shared/domain.types";
import { v4 as uuidv4 } from "uuid";

const CHANNEL_IDS = ["channel_1", "channel_2", "channel_3"];
const CHANNEL_LABELS: Record<string, string> = {
  channel_1: "@mojito_brand (Instagram)",
  channel_2: "@mojito_official (X)",
  channel_3: "Mojito Brand Page (Facebook)",
};

const DAYS: QueueSlot["dayOfWeek"][] = [0, 1, 2, 3, 4, 5, 6];
const TIMES = ["09:00", "12:00", "15:00", "18:00", "21:00"];

let queueSlots: QueueSlot[] = CHANNEL_IDS.flatMap((channelId) =>
  DAYS.flatMap((day) =>
    TIMES.map((time) => ({
      id: uuidv4(),
      channelId,
      dayOfWeek: day,
      time,
      timezone: "UTC",
    })),
  ),
);

let queuedContentIds: string[] = [];

export async function fetchQueueSlots(
  channelId?: string,
): Promise<QueueSlot[]> {
  await delay(300);
  return channelId
    ? queueSlots.filter((s) => s.channelId === channelId)
    : queueSlots;
}

export async function fetchQueuedContent(
  channelId?: string,
): Promise<ContentItem[]> {
  await delay(300);
  const { fetchContentItems } = await import("../content/content.api");
  const all = await fetchContentItems({ status: "scheduled", pageSize: 100 });
  return all.data.filter((item) =>
    channelId ? item.variants.some((v) => v.channelId === channelId) : true,
  );
}

export async function addQueueSlot(
  slot: Omit<QueueSlot, "id">,
): Promise<QueueSlot> {
  await delay(300);
  const newSlot = { ...slot, id: uuidv4() };
  queueSlots.push(newSlot);
  return newSlot;
}

export async function updateQueueSlot(
  id: string,
  data: Partial<QueueSlot>,
): Promise<QueueSlot> {
  await delay(300);
  const idx = queueSlots.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error("Slot not found");
  queueSlots[idx] = { ...queueSlots[idx], ...data, id };
  return queueSlots[idx];
}

export async function deleteQueueSlot(id: string): Promise<void> {
  await delay(300);
  queueSlots = queueSlots.filter((s) => s.id !== id);
}

export async function placeInQueue(
  contentId: string,
  slotId: string,
): Promise<void> {
  await delay(300);
  if (!queuedContentIds.includes(contentId)) {
    queuedContentIds.push(contentId);
  }
}

export async function removeFromQueue(contentId: string): Promise<void> {
  await delay(300);
  queuedContentIds = queuedContentIds.filter((id) => id !== contentId);
}

export async function reorderQueue(
  channelId: string,
  orderedIds: string[],
): Promise<void> {
  await delay(300);
  // mock reorder — no-op in memory beyond acknowledging
}

export async function getNextSlot(
  channelId: string,
): Promise<QueueSlot | null> {
  await delay(200);
  const now = new Date();
  const dayOfWeek = now.getDay() as QueueSlot["dayOfWeek"];
  const slots = queueSlots.filter((s) => s.channelId === channelId);
  return slots.find((s) => s.dayOfWeek >= dayOfWeek) ?? slots[0] ?? null;
}

export { CHANNEL_LABELS };

// TODO(backend): replace in-memory queue store with real API adapter
