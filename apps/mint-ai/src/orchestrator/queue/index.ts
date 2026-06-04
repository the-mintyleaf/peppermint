import { Queue } from "bullmq";
import { getRedisClient } from "@/shared/redis/redis";
import { logger } from "@/shared/logging";

// ? Reuse a single connection for queues
const connection = getRedisClient();

export const runsQueue = new Queue("runs", {
  connection,
  defaultJobOptions: {
    attempts: 5, // ? Retry up to 5 times
    backoff: { type: "exponential", delay: 1000 }, // ? Exponential backoff
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export const nodesQueue = new Queue("nodes", {
  connection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// ? Log queue lifecycle (optional)
[runsQueue, nodesQueue].forEach((q) => {
  q.on("error", (err) => logger.error({ err, queue: q.name }, "Queue error"));
});
