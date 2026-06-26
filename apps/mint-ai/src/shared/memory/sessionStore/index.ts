// src/shared/memory/sessionStore/index.ts

import {
  schemaMemorySessionMessage,
  PropMemorySessionMessage,
} from "@/shared/memory/sessionStore/memorySession.type";
import { getRedisClient } from "@/shared/redis/redis";

const SESSION_PREFIX = "session:";

function sessionKey(sessionId: string): string {
  return `${SESSION_PREFIX}${sessionId}:messages`;
}

const redis = getRedisClient();

/**
 * Push a message into the session timeline.
 * Oldest entries beyond `maxLen` are trimmed.
 */
export async function pushMessage(
  sessionId: string,
  message: PropMemorySessionMessage,
  maxLen = 20,
  ttlSec = 3600,
): Promise<void> {
  const parsed = schemaMemorySessionMessage.parse(message);
  const key = sessionKey(sessionId);

  await redis.lpush(key, JSON.stringify(parsed));
  await redis.ltrim(key, 0, maxLen - 1);
  await redis.expire(key, ttlSec);
}

/**
 * Get last N messages from the session timeline.
 */
export async function getLastMessages(
  sessionId: string,
  n = 20,
): Promise<PropMemorySessionMessage[]> {
  const raw = await redis.lrange(sessionKey(sessionId), 0, n - 1);
  return raw.map((m) => schemaMemorySessionMessage.parse(JSON.parse(m)));
}

/**
 * Replace (or insert if missing) a tagged message.
 * Use for maintaining a single authoritative summary per session.
 */
export async function replaceMessage(
  sessionId: string,
  msg: PropMemorySessionMessage,
  opts: { tag: string },
): Promise<void> {
  const key = sessionKey(sessionId);
  const all = await redis.lrange(key, 0, -1);

  let replaced = false;
  for (let i = 0; i < all.length; i++) {
    const parsed = JSON.parse(all[i]) as PropMemorySessionMessage & {
      tag?: string;
    };
    if (parsed.tag === opts.tag) {
      await redis.lset(key, i, JSON.stringify({ ...msg, tag: opts.tag }));
      replaced = true;
      break;
    }
  }

  if (!replaced) {
    await redis.rpush(key, JSON.stringify({ ...msg, tag: opts.tag }));
  }

  await redis.expire(key, 3600);
}
