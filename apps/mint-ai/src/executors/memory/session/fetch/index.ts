import {
  ExecutorContext,
  createExecutorError,
} from "@/shared/executor-context";
import { Result, ok, err } from "@/shared/result";
import {
  schemaNodeSessionFetchInput,
  PropNodeSessionFetchOutput,
} from "./fetch.type";
import { getLastMessages } from "@/shared/memory/sessionStore";

/**
 * Session Fetch Executor: Load message history for a session
 *
 * Retrieves the last N messages from Redis session storage.
 * Used during workflow execution to load context for LLM reasoning.
 *
 * @param input - Raw input to validate (sessionId, limit)
 * @param ctx - ExecutorContext with logger, metrics, config
 * @param config - Optional executor config (not used for session fetch)
 * @returns Result<PropNodeSessionFetchOutput, ExecutorError> - Message history
 */
export async function nodeSessionFetch(
  input: unknown,
  ctx: ExecutorContext,
  config?: any,
): Promise<Result<PropNodeSessionFetchOutput, any>> {
  try {
    // 1. Validate input schema
    const parseResult = schemaNodeSessionFetchInput.safeParse(input);
    if (!parseResult.success) {
      ctx.logger.warn(
        {
          errors: parseResult.error.issues,
          nodeId: ctx.nodeId,
        },
        "Invalid input to nodeSessionFetch",
      );
      return err(
        createExecutorError(
          "INVALID_INPUT",
          `Invalid input: ${parseResult.error.message}`,
          {
            nodeId: ctx.nodeId,
            retryable: false,
          },
        ),
      );
    }

    const parsed = parseResult.data;

    ctx.logger.debug(
      {
        event: "session.fetch.started",
        nodeId: ctx.nodeId,
        sessionId: parsed.sessionId,
        limit: parsed.limit,
      },
      "Fetching session messages",
    );

    // 2. Fetch messages from session store
    let messages;
    try {
      messages = await getLastMessages(parsed.sessionId, parsed.limit);
    } catch (fetchErr) {
      ctx.logger.error(
        {
          event: "session.fetch.error",
          nodeId: ctx.nodeId,
          sessionId: parsed.sessionId,
          error: fetchErr,
        },
        "Failed to fetch session messages",
      );
      return err(
        createExecutorError(
          "TOOL_ERROR",
          `Failed to fetch messages: ${fetchErr instanceof Error ? fetchErr.message : String(fetchErr)}`,
          {
            nodeId: ctx.nodeId,
            cause: fetchErr,
            retryable: true, // Storage errors may be transient
          },
        ),
      );
    }

    // 3. Build output
    const output = { messages };

    ctx.logger.debug(
      {
        event: "session.fetch.completed",
        nodeId: ctx.nodeId,
        sessionId: parsed.sessionId,
        messageCount: messages.length,
      },
      "Session messages fetched",
    );

    return ok(output);
  } catch (error) {
    const executorError = createExecutorError(
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : "Unknown error",
      {
        nodeId: ctx.nodeId,
        cause: error,
        retryable: false,
      },
    );

    ctx.logger.error(
      {
        error: executorError,
        nodeId: ctx.nodeId,
      },
      "Unexpected error in nodeSessionFetch",
    );

    return err(executorError);
  }
}
