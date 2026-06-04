import { ExecutorContext, createExecutorError } from "@/shared/executor-context";
import { Result, ok, err } from "@/shared/result";
import {
  PropNodeNoopInput,
  PropNodeNoopOutput,
  nodeNoopInputSchema,
  nodeNoopOutputSchema,
} from "@/executors/nodes/system/nodeNoop/nodeNoop.type";

/**
 * Noop Node Executor: Echoes input payload back as output
 *
 * A simple pass-through executor that validates input and echoes the payload.
 * Useful for testing workflows and as a placeholder in complex flows.
 *
 * @param input - Raw input to validate (should be PropNodeNoopInput)
 * @param ctx - ExecutorContext with logger, metrics, config
 * @param config - Optional executor config
 * @returns Result<PropNodeNoopOutput, ExecutorError>
 */
export const nodeNoop = async (
  input: unknown,
  ctx: ExecutorContext,
  config?: any
): Promise<Result<PropNodeNoopOutput, any>> => {
  try {
    // 1. Validate input schema
    const parseResult = nodeNoopInputSchema.safeParse(input);
    if (!parseResult.success) {
      ctx.logger.warn(
        {
          errors: parseResult.error.issues,
          nodeId: ctx.nodeId,
        },
        "Invalid input to nodeNoop"
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
        event: "noop.node.started",
        nodeId: ctx.nodeId,
        payloadType: typeof parsed.payload,
      },
      "Processing noop node"
    );

    // 2. Echo the payload
    const output = { echoed: parsed.payload };

    // 3. Validate output schema
    const outputParseResult = nodeNoopOutputSchema.safeParse(output);
    if (!outputParseResult.success) {
      ctx.logger.error(
        {
          errors: outputParseResult.error.issues,
          event: "noop.node.invalid_output",
          nodeId: ctx.nodeId,
        },
        "Output validation failed for nodeNoop"
      );
      return err(
        createExecutorError(
          "INVALID_OUTPUT",
          `Output validation failed: ${outputParseResult.error.message}`,
          {
            nodeId: ctx.nodeId,
            retryable: false,
          }
        )
      );
    }

    ctx.logger.debug(
      {
        event: "noop.node.completed",
        nodeId: ctx.nodeId,
      },
      "Noop node completed successfully"
    );

    return ok(outputParseResult.data);
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
      { error: executorError, event: "noop.node.error" },
      "Unexpected error in nodeNoop"
    );
    return err(executorError);
  }
};
