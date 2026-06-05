/**
 * Factory to create ExecutorContext with all dependencies
 *
 * This centralizes dependency injection so executors don't need to know how
 * to construct the context—they just use it.
 */

import { Logger } from "pino";
import { Redis } from "ioredis";
import {
  ExecutorContext,
  ChatModelsRegistry,
  MetricsCollector,
  RuntimeConfig,
  MemoryStore,
} from "./executor-context.type";
import { logger as defaultLogger } from "@/shared/logging";
import { getRedisClient } from "@/shared/redis/redis";

const defaultRedis = getRedisClient();

interface CreateContextOptions {
  requestId: string;
  runId: string;
  nodeId: string;
  sessionId?: string;
  redis?: Redis;
  logger?: Logger;
  models: ChatModelsRegistry;
  metrics: MetricsCollector;
  config: RuntimeConfig;
  memory: MemoryStore;
  isCancelled?: () => Promise<boolean>;
  emitEvent?: (eventType: string, data: any) => Promise<void>;
}

/**
 * Create an ExecutorContext with all dependencies injected
 */
export async function createExecutorContext(
  options: CreateContextOptions
): Promise<ExecutorContext> {
  const {
    requestId,
    runId,
    nodeId,
    sessionId,
    redis = defaultRedis,
    logger = defaultLogger,
    models,
    metrics,
    config,
    memory,
    isCancelled = async () => {
      // Default: check if run was marked as cancelled in Redis
      const key = `run:${runId}:cancelled`;
      return !!(await redis.get(key));
    },
    emitEvent = async () => {
      // Default: no-op (implement real SSE in apps/api)
    },
  } = options;

  // Create child logger with context
  const contextLogger = logger.child({
    requestId,
    runId,
    nodeId,
    ...(sessionId && { sessionId }),
  });

  return {
    requestId,
    runId,
    nodeId,
    sessionId,
    redis,
    logger: contextLogger,
    models,
    metrics,
    config,
    memory,
    isCancelled,
    emitEvent,
  };
}

/**
 * Create a minimal ExecutorContext for testing/mocking
 *
 * Useful in unit tests where you want to provide minimal dependencies.
 */
export function createMockExecutorContext(
  overrides?: Partial<ExecutorContext>
): ExecutorContext {
  const mockRedis = {
    get: async () => null,
    set: async () => "OK",
    del: async () => 0,
    expire: async () => 1,
    lpush: async () => 1,
    lrange: async () => [],
    ltrim: async () => "OK",
  } as any;

  const mockLogger = {
    info: () => {},
    debug: () => {},
    warn: () => {},
    error: () => {},
    child: () => mockLogger,
  } as any;

  const mockMetrics = {
    recordExecutorSuccess: () => {},
    recordExecutorError: () => {},
    recordTokens: () => {},
    getRunTokenCount: async () => 0,
    recordToolCall: () => {},
    getQueueDepth: async () => 0,
  } as any;

  const mockMemory = {
    getSessionMessages: async () => [],
    addSessionMessage: async () => {},
    getSessionSummary: async () => null,
    updateSessionSummary: async () => {},
    clearSession: async () => {},
  } as any;

  const defaultContext: ExecutorContext = {
    requestId: "mock-request-id",
    runId: "mock-run-id",
    nodeId: "mock-node-id",
    sessionId: "mock-session-id",
    redis: mockRedis,
    logger: mockLogger,
    models: {
      getModel: () => null,
      listModels: () => [],
    },
    metrics: mockMetrics,
    config: {
      nodeEnv: "development" as const,
    },
    memory: mockMemory,
    isCancelled: async () => false,
    emitEvent: async () => {},
  };

  return {
    ...defaultContext,
    ...overrides,
  };
}
