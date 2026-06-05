import { ExecutorContext, createExecutorError } from "@/shared/executor-context";
import { Result, ok, err } from "@/shared/result";
import {
  PropNodeGuardPolicyInput,
  PropNodeGuardPolicyOutput,
  nodeGuardPolicyInputSchema,
  nodeGuardPolicyOutputSchema,
} from "@/executors/nodes/system/nodeGuardPolicy/nodeGuardPolicy.type";

import "dotenv/config"; // ✅ Ensure process.env is loaded

/**
 * Guard Policy Node: Validates input against policies
 *
 * A simple guard that allows if message length < 200, otherwise denies.
 * Can be extended with additional policy checks.
 *
 * @param input - Raw input to validate (should be PropNodeGuardPolicyInput)
 * @param ctx - ExecutorContext with logger, metrics, etc.
 * @returns Result<PropNodeGuardPolicyOutput, ExecutorError>
 */
export const nodeGuardPolicy = async (
  input: unknown,
  ctx: ExecutorContext
): Promise<Result<PropNodeGuardPolicyOutput, any>> => {
  try {
    // 1. Validate input schema
    const parseResult = nodeGuardPolicyInputSchema.safeParse(input);
    if (!parseResult.success) {
      ctx.logger.warn(
        {
          errors: parseResult.error.issues,
          nodeId: ctx.nodeId,
        },
        "Invalid input to nodeGuardPolicy"
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
        event: "node.started",
        nodeId: ctx.nodeId,
        inputPreview: parsed.message.substring(0, 50),
        messageLength: parsed.message.length,
      },
      "Executing nodeGuardPolicy"
    );

    // 2. Apply guard policies
    let allow = true;
    let reason: string | undefined;

    if (parsed.message.length > 200) {
      allow = false;
      reason = "Message too long";
      ctx.logger.warn(
        {
          event: "guard.denied",
          nodeId: ctx.nodeId,
          reason,
          messageLength: parsed.message.length,
        },
        "Guard policy denied input"
      );
    }

    // 3. Validate output schema
    const output = { allow, reason };
    const validateResult = nodeGuardPolicyOutputSchema.safeParse(output);
    if (!validateResult.success) {
      ctx.logger.error(
        {
          errors: validateResult.error.issues,
          nodeId: ctx.nodeId,
        },
        "Invalid output from nodeGuardPolicy"
      );
      return err(
        createExecutorError(
          "INVALID_OUTPUT",
          `Invalid output: ${validateResult.error.message}`,
          {
            nodeId: ctx.nodeId,
            retryable: false,
          }
        )
      );
    }

    ctx.logger.debug(
      {
        event: "node.finished",
        nodeId: ctx.nodeId,
        allow: validateResult.data.allow,
        reason: validateResult.data.reason,
      },
      "nodeGuardPolicy execution complete"
    );

    return ok(validateResult.data);
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
      "Unexpected error in nodeGuardPolicy"
    );

    return err(executorError);
  }
};
