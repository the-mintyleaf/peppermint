import Redis from "ioredis";
import { logger } from "@/shared/logging";
import "dotenv/config";

let redisClient: Redis | null = null;
let redisSubscriber: Redis | null = null;

/**
 * Singleton Redis subscriber — separate connection required for pub/sub mode.
 * Must not be reused for general commands once subscribed.
 */
export function getRedisSubscriber(): Redis {
  if (!redisSubscriber) {
    const url = process.env.VAGENT_REDIS_URL;
    if (!url) throw new Error("Missing env: VAGENT_REDIS_URL");

    redisSubscriber = new Redis(url);

    redisSubscriber.on("connect", () =>
      logger.info(
        { event: "redis.subscriber.connected" },
        "Redis subscriber connected",
      ),
    );
    redisSubscriber.on("error", (err) =>
      logger.error(
        { event: "redis.subscriber.error", err },
        "Redis subscriber error",
      ),
    );
  }
  return redisSubscriber;
}

/**
 * Singleton Redis client
 */
export function getRedisClient(): Redis {
  if (!redisClient) {
    const url = process.env.VAGENT_REDIS_URL;
    if (!url) {
      throw new Error("Missing env: VAGENT_REDIS_URL");
    }

    redisClient = new Redis(url, {
      maxRetriesPerRequest: null, // ✅ Required for BullMQ compatibility
    });

    redisClient.on("connect", () =>
      logger.info(
        {
          event: "redis.connected",
          url,
        },
        "Redis connected and ready to process jobs",
      ),
    );

    redisClient.on("error", (err) =>
      logger.error(
        {
          event: "redis.error",
          url,
          err,
        },
        "Redis connection error",
      ),
    );

    redisClient.on("close", () =>
      logger.warn(
        {
          event: "redis.closed",
          url,
        },
        "Redis connection closed",
      ),
    );
  }

  return redisClient;
}
