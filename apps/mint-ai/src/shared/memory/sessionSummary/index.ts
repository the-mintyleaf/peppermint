import { z } from "zod";
import { getRedisClient } from "@/shared/redis/redis";
import { logger } from "@/shared/logging";
import {
  PropSessionSummary,
  schemaSessionSummary,
} from "./sessionSummary.type";

const SUMMARY_KEY = (sessionId: string) => `session:${sessionId}:summary`;

/** Fetch structured session summary (JSON) */
export async function getSessionSummary(
  sessionId: string
): Promise<PropSessionSummary> {
  const redis = getRedisClient();
  try {
    const raw = await redis.get(SUMMARY_KEY(sessionId));
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return schemaSessionSummary.parse(parsed);
  } catch (err) {
    logger.warn(
      { sessionId, err },
      "Failed to parse session summary — resetting"
    );
    return {};
  }
}

/** Overwrite session summary with merged object */
export async function setSessionSummary(
  sessionId: string,
  summary: PropSessionSummary
): Promise<void> {
  const redis = getRedisClient();
  await redis.set(
    SUMMARY_KEY(sessionId),
    JSON.stringify(summary),
    "EX",
    60 * 60
  ); // 1h TTL
}
