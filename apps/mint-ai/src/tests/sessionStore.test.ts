import { describe, it, expect, beforeAll, afterAll } from "vitest";

import { pushMessage, getLastMessages } from "@/shared/memory/sessionStore";
import { getRedisClient } from "@/shared/redis/redis";

const redis = getRedisClient();

describe("sessionStore", () => {
  const sessionId = "test-session";

  beforeAll(async () => {
    await redis.del(`session:${sessionId}:messages`);
  });

  afterAll(async () => {
    await redis.quit();
  });

  it("stores and retrieves messages", async () => {
    await pushMessage(sessionId, { role: "user", content: "hello" });
    const msgs = await getLastMessages(sessionId, 5);
    expect(msgs[0]).toEqual({ role: "user", content: "hello" });
  });
});
