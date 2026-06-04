import { ExecutorContext, createExecutorError } from "@/shared/executor-context";
import { Result, ok, err } from "@/shared/result";
import { schemaApiCallInput, schemaApiCallOutput, PropApiCallInput, PropApiCallOutput } from "./apicall.type";
import { apiDispatch } from "@/shared/helpers/apiDispatch";
import { resolveToolConfig } from "@/shared/helpers/resolveToolDynamic";

/**
 * API Call Tool: Execute HTTP requests with result extraction
 *
 * Supports GET, POST, PUT, PATCH, DELETE with optional dataKey extraction.
 * Gracefully handles errors and provides comprehensive logging.
 *
 * @param input - Raw input to validate (API request payload)
 * @param ctx - ExecutorContext with logger, metrics, config
 * @param config - Tool configuration (url, method, headers, dataKey)
 * @returns Result<PropApiCallOutput, ExecutorError> - JSON string of response
 */
export async function toolApiCall(
  input: unknown,
  ctx: ExecutorContext,
  config?: any
): Promise<Result<PropApiCallOutput, any>> {
  try {
    // 1. Validate input schema
    const parseResult = schemaApiCallInput.safeParse(input);
    if (!parseResult.success) {
      ctx.logger.warn(
        {
          errors: parseResult.error.issues,
          nodeId: ctx.nodeId,
        },
        "Invalid input to toolApiCall"
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

    const parsedInput = parseResult.data;

    // 2. Resolve tool configuration
    if (!config?.url) {
      return err(
        createExecutorError(
          "CONFIG_ERROR",
          "Missing required config: url",
          {
            nodeId: ctx.nodeId,
            retryable: false,
          }
        )
      );
    }

    const resolvedConfig = resolveToolConfig(config, parsedInput || {});
    const method = (resolvedConfig.method || "GET").toUpperCase();

    ctx.logger.debug(
      {
        event: "tool.invoked",
        nodeId: ctx.nodeId,
        toolName: config?.name || "toolApiCall",
        method,
        url: resolvedConfig.url,
        dataKey: resolvedConfig.dataKey,
      },
      "toolApiCall invoked"
    );

    // 3. Execute API dispatch based on method
    let res;
    try {
      if (method === "GET") {
        // Never send a body for GET
        res = await apiDispatch.get(
          resolvedConfig.url,
          resolvedConfig.query,
          resolvedConfig.headers
        );
      } else if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
        res =
          (await apiDispatch[method.toLowerCase()]?.(
            resolvedConfig.url,
            resolvedConfig.body,
            resolvedConfig.headers
          )) ??
          (await apiDispatch.post(
            resolvedConfig.url,
            resolvedConfig.body,
            resolvedConfig.headers
          ));
      } else {
        // Fallback → treat as GET
        ctx.logger.debug(
          { method, nodeId: ctx.nodeId },
          "Unknown method, falling back to GET"
        );
        res = await apiDispatch.get(
          resolvedConfig.url,
          resolvedConfig.query,
          resolvedConfig.headers
        );
      }
    } catch (dispatchErr) {
      ctx.logger.error(
        {
          event: "tool.error",
          nodeId: ctx.nodeId,
          toolName: config?.name || "toolApiCall",
          method,
          url: resolvedConfig.url,
          error: dispatchErr,
        },
        "API dispatch failed"
      );
      return err(
        createExecutorError(
          "TOOL_ERROR",
          `API dispatch failed: ${dispatchErr instanceof Error ? dispatchErr.message : String(dispatchErr)}`,
          {
            nodeId: ctx.nodeId,
            cause: dispatchErr,
            retryable: true, // Network errors may be transient
          }
        )
      );
    }

    // 4. Extract data with optional dataKey
    let output: any = res.data;
    if (resolvedConfig.dataKey && res.data && typeof res.data === "object") {
      if (!(resolvedConfig.dataKey in res.data)) {
        ctx.logger.warn(
          {
            dataKey: resolvedConfig.dataKey,
            nodeId: ctx.nodeId,
            availableKeys: Object.keys(res.data),
          },
          "dataKey not found in response"
        );
      } else {
        output = res.data[resolvedConfig.dataKey];
      }
    }

    // 5. Serialize output to JSON string
    const resultString = JSON.stringify(output);

    // 6. Validate output schema
    const validateResult = schemaApiCallOutput.safeParse(resultString);
    if (!validateResult.success) {
      ctx.logger.error(
        {
          errors: validateResult.error.issues,
          nodeId: ctx.nodeId,
        },
        "Invalid output from toolApiCall"
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
        event: "tool.result",
        nodeId: ctx.nodeId,
        toolName: config?.name || "toolApiCall",
        method,
        url: resolvedConfig.url,
        resultPreview: resultString.substring(0, 100),
        statusCode: res.status,
      },
      "toolApiCall completed"
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
      "Unexpected error in toolApiCall"
    );

    return err(executorError);
  }
}
