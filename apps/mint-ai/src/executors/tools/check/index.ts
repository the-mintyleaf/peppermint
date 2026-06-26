import {
  ExecutorContext,
  createExecutorError,
} from "@/shared/executor-context";
import { Result, ok, err } from "@/shared/result";
import {
  PropToolCheckInput,
  PropToolCheckOutput,
  toolCheckInputSchema,
  toolCheckOutputSchema,
} from "@/executors/tools/check/check.type";

/**
 * Check Tool Executor: Validates input and returns timestamp-annotated result
 *
 * A simple check tool that validates the input string and returns it
 * with a timestamp. Useful for testing tool execution and debugging.
 *
 * @param input - Raw input to validate (should be PropToolCheckInput)
 * @param ctx - ExecutorContext with logger, metrics, config
 * @param config - Optional executor config
 * @returns Result<PropToolCheckOutput, ExecutorError>
 */
export const toolCheck = async (
  input: unknown,
  ctx: ExecutorContext,
  config?: any,
): Promise<Result<PropToolCheckOutput, any>> => {
  try {
    // 1. Validate input schema
    const parseResult = toolCheckInputSchema.safeParse(input);
    if (!parseResult.success) {
      ctx.logger.warn(
        {
          errors: parseResult.error.issues,
          nodeId: ctx.nodeId,
        },
        "Invalid input to toolCheck",
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
        event: "check.tool.started",
        nodeId: ctx.nodeId,
        inputLength: parsed.input.length,
      },
      "Processing check tool",
    );

    // 2. Process the input with timestamp
    const timestamp = new Date().toLocaleString();
    const resultString = `Input was: ${parsed.input} at ${timestamp}`;

    const output = { result: resultString };

    // 3. Validate output schema
    const outputParseResult = toolCheckOutputSchema.safeParse(output);
    if (!outputParseResult.success) {
      ctx.logger.error(
        {
          errors: outputParseResult.error.issues,
          event: "check.tool.invalid_output",
          nodeId: ctx.nodeId,
        },
        "Output validation failed for toolCheck",
      );
      return err(
        createExecutorError(
          "INVALID_OUTPUT",
          `Output validation failed: ${outputParseResult.error.message}`,
          {
            nodeId: ctx.nodeId,
            retryable: false,
          },
        ),
      );
    }

    ctx.logger.debug(
      {
        event: "check.tool.completed",
        nodeId: ctx.nodeId,
        resultLength: resultString.length,
      },
      "Check tool completed successfully",
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
      },
    );

    ctx.logger.error(
      { error: executorError, event: "check.tool.error" },
      "Unexpected error in toolCheck",
    );
    return err(executorError);
  }
};
