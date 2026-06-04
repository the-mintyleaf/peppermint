import { Worker } from "bullmq";
import { runsQueue, nodesQueue } from "@/orchestrator/queue";
import { getRedisClient } from "@/shared/redis/redis";
import { logger } from "@/shared/logging";
import { getWorkflow } from "@/workflows";
import { advanceWorkflow } from "@/orchestrator/runner";
import { eventBus } from "@/shared/events/eventBus";
import { executorRegistry } from "@/executors";
import { createExecutorContext } from "@/shared/executor-context";
import { isErr } from "@/shared/result";
import {
  detectExecutorPattern,
  normalizeExecutorOutput,
  adaptOldExecutorToNew,
  type ExecutorPattern,
} from "@/shared/executor-pattern";

import "dotenv/config";

const connection = getRedisClient();

// ? Helper: resolve executor function from hierarchical registry
function resolveExecutor(kind: string) {
  logger.info(
    {
      event: "executor.resolve",
      kind,
    },
    "Resolving executor"
  );

  const parts = ["nodes", ...kind.split(".")];
  let current: any = executorRegistry;

  for (const part of parts) {
    if (!current[part]) return undefined;
    current = current[part];
  }

  return typeof current === "function" ? current : undefined;
}

// ? Helper: Execute with pattern detection and adaptation
async function executeWithPatternDetection(
  executor: any,
  input: any,
  ctx: any,
  kind: string,
  config?: any
) {
  // 1. Detect the executor pattern
  const pattern = detectExecutorPattern(executor);

  logger.debug(
    {
      event: "executor.pattern.detected",
      kind,
      pattern,
    },
    `Executor pattern detected: ${pattern}`
  );

  // 2. Adapt old executors to new pattern
  let executableFunc = executor;
  if (pattern === "old") {
    logger.info(
      {
        event: "executor.adaptation",
        kind,
        from: "old",
        to: "new",
      },
      "Adapting old-pattern executor to new pattern"
    );
    executableFunc = adaptOldExecutorToNew(executor);
  }

  // 3. Execute with proper parameter passing
  let output: any;
  try {
    if (pattern === "new" || pattern === "unknown") {
      // New pattern or unknown: pass ExecutorContext
      output = await executableFunc(input, ctx, config);
    } else {
      // Old pattern (already adapted): pass input only (after adaptation)
      output = await executableFunc(input, ctx, config);
    }
  } catch (error) {
    logger.error(
      {
        event: "executor.execution.error",
        kind,
        pattern,
        error,
      },
      "Executor execution threw error"
    );
    throw error;
  }

  // 4. Normalize output to Result type
  const normalized = await normalizeExecutorOutput(output, pattern);

  logger.debug(
    {
      event: "executor.result.normalized",
      kind,
      pattern,
      isError: normalized.isErr?.(),
    },
    `Executor result normalized to Result type`
  );

  return normalized;
}

// ? Helper: Create models registry for executors
function createModelsRegistry() {
  return {
    getModel: (modelId: string) => null,
    listModels: () => [],
  };
}

// ? Helper: Create metrics collector
function createMetricsCollector() {
  return {
    recordExecutorSuccess: (nodeId: string, durationMs: number, metadata?: any) => {},
    recordExecutorError: (nodeId: string, errorCode: string, durationMs: number, metadata?: any) => {},
    recordTokens: (runId: string, tokens: any) => {},
    getRunTokenCount: async (runId: string) => 0,
    recordToolCall: (toolName: string, durationMs: number, success: boolean, metadata?: any) => {},
    getQueueDepth: async (queueName: string) => 0,
  };
}

// ? Helper: Create runtime config
function createRuntimeConfig() {
  return {
    nodeEnv: (process.env.NODE_ENV ?? "development") as "development" | "staging" | "production",
    maxTokensPerRun: Number(process.env.VAGENT_MAX_TOKENS_PER_RUN ?? 4000),
    maxToolIterations: Number(process.env.VAGENT_MAX_TOOL_ITERATIONS ?? 3),
    defaultTemperature: Number(process.env.VAGENT_DEFAULT_TEMPERATURE ?? 0.7),
  };
}

// ? Helper: Create memory store
function createMemoryStore(redis: any) {
  return {
    getSessionMessages: async (sessionId: string) => [],
    addSessionMessage: async (sessionId: string, message: any) => {},
    getSessionSummary: async (sessionId: string) => null,
    updateSessionSummary: async (sessionId: string, summary: Record<string, string>) => {},
    clearSession: async (sessionId: string) => {},
  };
}

// ? Worker for "runs" queue (orchestration-level jobs)
const runsWorker = new Worker(
  "runs",
  async (job) => {
    const { runId, workflowId, input, sessionId } = job.data;

    logger.info(
      {
        event: "run.initiated",
        runId,
        workflowId,
        sessionId,
      },
      "Workflow initiated"
    );

    const wf = getWorkflow(workflowId);
    if (!wf) throw new Error(`Unknown workflow: ${workflowId}`);

    // emit run.started
    eventBus.emitEvent({ runId, type: "run.started" });

    const entryNode = wf.nodes.find((n) => n.id === wf.entry);
    if (!entryNode) throw new Error(`No entry node in workflow: ${workflowId}`);

    logger.info(
      {
        event: "node.enqueued",
        runId,
        workflowId,
        sessionId,
        nodeId: entryNode.id,
        kind: entryNode.kind,
      },
      "Enqueued entry node"
    );

    await nodesQueue.add("node", {
      runId,
      workflowId,
      nodeId: entryNode.id,
      kind: entryNode.kind,
      sessionId,
      input: { ...input },
      config: entryNode.config ?? {},
    });
  },
  {
    connection,
    concurrency: Number(process.env.VAGENT_WORKER_CONCURRENCY ?? 5),
  }
);

// ? Worker for "nodes" queue (individual node execution jobs)
const nodesWorker = new Worker(
  "nodes",
  async (job) => {
    const {
      runId,
      workflowId,
      sessionId,
      nodeId,
      kind,
      input,
      config = {},
    } = job.data;

    const executor = resolveExecutor(kind);
    if (!executor) throw new Error(`No executor found for kind: ${kind}`);

    eventBus.emitEvent({ runId, type: "node.started", data: { nodeId } });

    try {
      // Create ExecutorContext with all dependencies
      const ctx = await createExecutorContext({
        requestId: `req-${runId}`,
        runId,
        nodeId,
        sessionId,
        redis: connection,
        logger,
        models: createModelsRegistry(),
        metrics: createMetricsCollector(),
        config: createRuntimeConfig(),
        memory: createMemoryStore(connection),
        emitEvent: async (eventType: string, data: any) => {
          eventBus.emitEvent({ runId, type: eventType, data });
        },
      });

      // Execute with pattern detection and adaptation
      // This handles both old and new executor patterns seamlessly
      const result = await executeWithPatternDetection(
        executor,
        input,
        ctx,
        kind,
        config
      );

      // Handle Result type - check if error or success
      if (isErr(result)) {
        logger.error(
          {
            event: "node.failed",
            runId,
            workflowId,
            sessionId,
            nodeId,
            kind,
            error: result.error,
          },
          "Node execution failed with error result"
        );
        throw result.error; // let BullMQ retry
      }

      const nodeResult = result.value;

      eventBus.emitEvent({
        runId,
        type: "node.finished",
        data: { nodeId, result: nodeResult },
      });

      logger.info(
        {
          event: "node.completed",
          runId,
          workflowId,
          sessionId,
          nodeId,
          kind,
        },
        "Node execution completed"
      );

      await advanceWorkflow({
        runId,
        workflowId,
        sessionId,
        nodeId,
        output: nodeResult,
        input: { ...input, sessionId },
      });
    } catch (err) {
      logger.error(
        {
          event: "node.failed",
          runId,
          workflowId,
          sessionId,
          nodeId,
          kind,
          err,
        },
        "Node execution failed"
      );
      throw err; // let BullMQ retry
    }
  },
  {
    connection,
    concurrency: Number(process.env.VAGENT_WORKER_CONCURRENCY ?? 10),
  }
);

// ? Graceful shutdown
const shutdown = async () => {
  logger.info({ event: "worker.shutdown" }, "Shutting down workers");
  await runsWorker.close();
  await nodesWorker.close();
  connection.disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
