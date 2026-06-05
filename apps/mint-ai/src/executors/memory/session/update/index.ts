import { ExecutorContext, createExecutorError } from "@/shared/executor-context";
import { Result, ok, err } from "@/shared/result";
import {
  schemaNodeSessionUpdateInput,
  PropNodeSessionUpdateOutput,
} from "./update.type";
import { pushMessage } from "@/shared/memory/sessionStore";

/**
 * Session Update Executor: Store new messages in session history
 *
 * Appends a message to the session message history and trims older entries
 * based on maxLen. Used during workflow execution to persist LLM outputs.
 *
 * @param input - Raw input to validate (sessionId, message, maxLen, ttlSec)
 * @param ctx - ExecutorContext with logger, metrics, config
 * @param config - Optional executor config (not used for session update)
 * @returns Result<PropNodeSessionUpdateOutput, ExecutorError> - Success flag
 */
export async function nodeSessionUpdate(
  input: unknown,
  ctx: ExecutorContext,
  config?: any
): Promise<Result<PropNodeSessionUpdateOutput, any>> {
  try {
    // 1. Validate input schema
    const parseResult = schemaNodeSessionUpdateInput.safeParse(input);
    if (!parseResult.success) {
      ctx.logger.warn(
        {
          errors: parseResult.error.issues,
          nodeId: ctx.nodeId,
        },
        "Invalid input to nodeSessionUpdate"
      );
      return err(
        createExecutorError(
          "INVALID_INPUT",
          `Invalid input: ${parseResult.error.message}`,
          {
            nodeId: ctx.nodeId,
            retryable: false,
          }
        )
      );
    }

    const parsed = parseResult.data;

    ctx.logger.debug(
      {
        event: "session.update.started",
        nodeId: ctx.nodeId,
        sessionId: parsed.sessionId,
        messageRole: parsed.message.role,
        maxLen: parsed.maxLen,
        ttlSec: parsed.ttlSec,
      },
      "Updating session messages"
    );

    // 2. Push message to session store
    try {
      await pushMessage(
        parsed.sessionId,
        parsed.message,
        parsed.maxLen,
        parsed.ttlSec
      );
    } catch (pushErr) {
      ctx.logger.error(
        {
          event: "session.update.error",
          nodeId: ctx.nodeId,
          sessionId: parsed.sessionId,
          error: pushErr,
        },
        "Failed to update session messages"
      );
      return err(
        createExecutorError(
          "TOOL_ERROR",
          `Failed to update messages: ${pushErr instanceof Error ? pushErr.message : String(pushErr)}`,
          {
            nodeId: ctx.nodeId,
            cause: pushErr,
            retryable: true, // Storage errors may be transient
          }
        )
      );
    }

    ctx.logger.debug(
      {
        event: "session.update.completed",
        nodeId: ctx.nodeId,
        sessionId: parsed.sessionId,
      },
      "Session messages updated"
    );

    // 3. Return success
    return ok({ success: true });
  } catch (error) {
    const executorError = createExecutorError(
      "INTERNAL_ERROR",
      error instanceof Error ? error.message : "Unknown error",
      {
        nodeId: ctx.nodeId,
        cause: error,
        retryable: false,
      }
    );

    ctx.logger.error(
      {
        error: executorError,
        nodeId: ctx.nodeId,
      },
      "Unexpected error in nodeSessionUpdate"
    );

    return err(executorError);
  }
}
