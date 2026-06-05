/**
 * ExecutorContext — Dependency Injection for Executors
 *
 * Provides access to all cross-cutting concerns (Redis, logger, models, config, metrics).
 * Executors should only depend on ExecutorContext, not directly on singletons.
 *
 * This enables:
 * - Easy testing (mock the context)
 * - Swappable implementations (Redis → Postgres, etc.)
 * - Uniform observability (logging, metrics, tracing)
 * - Configuration management
 */

import { Logger } from "pino";
import { Redis } from "ioredis";

export interface ExecutorContext {
  /**
   * Unique request identifier (for tracing across logs)
   */
  requestId: string;

  /**
   * Run identifier (workflow execution)
   */
  runId: string;

  /**
   * Node identifier within the workflow
   */
  nodeId: string;

  /**
   * Session identifier (user/conversation)
   */
  sessionId?: string;

  /**
   * Redis client for ephemeral storage
   */
  redis: Redis;

  /**
   * Logger instance with context (runId, nodeId, sessionId already injected)
   */
  logger: Logger;

  /**
   * Chat models registry (LLM providers)
   */
  models: ChatModelsRegistry;

  /**
   * Metrics collector for observability
   */
  metrics: MetricsCollector;

  /**
   * Runtime configuration
   */
  config: RuntimeConfig;

  /**
   * Memory store for session history and summaries
   */
  memory: MemoryStore;

  /**
   * Signal to check if run was cancelled
   */
  isCancelled: () => Promise<boolean>;

  /**
   * Emit an event for SSE streaming
   */
  emitEvent: (eventType: string, data: any) => Promise<void>;
}

/**
 * Chat models registry — maps model ID → provider instance
 */
export interface ChatModelsRegistry {
  getModel(modelId: string): ChatModel | null;
  listModels(): string[];
}

/**
 * Chat model provider interface
 */
export interface ChatModel {
  invoke(
    messages: any[],
    options?: { temperature?: number; tools?: any[] }
  ): Promise<any>;
}

/**
 * Metrics collection interface
 */
export interface MetricsCollector {
  /**
   * Record successful executor completion
   */
  recordExecutorSuccess(
    nodeId: string,
    durationMs: number,
    metadata?: Record<string, any>
  ): void;

  /**
   * Record executor failure
   */
  recordExecutorError(
    nodeId: string,
    errorCode: string,
    durationMs: number,
    metadata?: Record<string, any>
  ): void;

  /**
   * Record token usage for LLM operations
   */
  recordTokens(
    runId: string,
    tokens: { input: number; output: number; total: number }
  ): void;

  /**
   * Get total tokens used in a run
   */
  getRunTokenCount(runId: string): Promise<number>;

  /**
   * Record tool invocation
   */
  recordToolCall(
    toolName: string,
    durationMs: number,
    success: boolean,
    metadata?: Record<string, any>
  ): void;

  /**
   * Get current queue depth
   */
  getQueueDepth(queueName: string): Promise<number>;
}

/**
 * Runtime configuration
 */
export interface RuntimeConfig {
  /**
   * Node environment
   */
  nodeEnv: "development" | "staging" | "production";

  /**
   * Max tokens per run (hard limit)
   */
  maxTokensPerRun?: number;

  /**
   * Max execution duration per run (ms)
   */
  maxDurationPerRun?: number;

  /**
   * Session memory limit (messages to keep)
   */
  sessionMemoryLimit?: number;

  /**
   * Session TTL (seconds)
   */
  sessionTtl?: number;

  /**
   * Max tool-calling loops
   */
  maxToolLoops?: number;

  /**
   * Default system prompt
   */
  defaultSystemPrompt?: string;

  /**
   * API base URLs for tool calls (allow-list)
   */
  allowedApiHosts?: string[];

  /**
   * Request timeout (ms)
   */
  requestTimeoutMs?: number;

  /**
   * Custom config per tenant/app
   */
  custom?: Record<string, any>;
}

/**
 * Memory store interface
 */
export interface MemoryStore {
  /**
   * Fetch recent session messages
   */
  getSessionMessages(
    sessionId: string,
    limit?: number
  ): Promise<Array<{ role: string; content: string }>>;

  /**
   * Add message to session
   */
  addSessionMessage(
    sessionId: string,
    message: { role: string; content: string }
  ): Promise<void>;

  /**
   * Get session summary
   */
  getSessionSummary(sessionId: string): Promise<Record<string, string> | null>;

  /**
   * Update session summary (merge)
   */
  updateSessionSummary(
    sessionId: string,
    summary: Record<string, string>
  ): Promise<void>;

  /**
   * Clear session (on completion or timeout)
   */
  clearSession(sessionId: string): Promise<void>;
}

/**
 * Executor function signature (type-safe with Result pattern)
 */
export type ExecutorFn<Input, Output, Error> = (
  input: Input,
  ctx: ExecutorContext
) => Promise<Result<Output, Error>>;

/**
 * Result type (must import from @/shared/result)
 */
export type Result<T, E> = { isOk: () => boolean; isErr: () => boolean } & (
  | { isOk: () => true; value: T; error?: never }
  | { isErr: () => true; error: E; value?: never }
);
