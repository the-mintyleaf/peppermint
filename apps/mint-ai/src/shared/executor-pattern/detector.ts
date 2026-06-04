import { Result, isErr } from "@/shared/result";
import { ExecutorError } from "@/shared/executor-context";

/**
 * Executor Pattern Detector
 *
 * Detects whether an executor follows the new Result<T, E> pattern
 * or the old pattern (direct return/throw).
 *
 * This enables seamless compatibility between old and new executors.
 */

export type ExecutorPattern = "new" | "old" | "unknown";

/**
 * Detects the executor pattern by inspecting function signature and behavior
 *
 * @param executor - The executor function to inspect
 * @returns The detected pattern: "new", "old", or "unknown"
 */
export function detectExecutorPattern(executor: any): ExecutorPattern {
  if (typeof executor !== "function") {
    return "unknown";
  }

  // Check function arity (number of parameters)
  // New pattern: (input, ctx, config?) = 2-3 params
  // Old pattern: (input) = 1 param
  const paramCount = executor.length;

  if (paramCount >= 2) {
    return "new";
  }

  if (paramCount === 1) {
    return "old";
  }

  return "unknown";
}

/**
 * Normalizes executor output to always return Result<T, E>
 *
 * - If executor returns Result type: pass through
 * - If executor returns plain value: wrap in Result.ok()
 * - If executor throws error: wrap error in Result.err()
 *
 * @param output - The executor output (Result, plain value, or thrown error)
 * @param pattern - The detected executor pattern
 * @returns Normalized Result type
 */
export async function normalizeExecutorOutput(
  output: any,
  pattern: ExecutorPattern
): Promise<Result<any, any>> {
  try {
    // Check if output is already a Result type
    if (output && typeof output === "object") {
      if ("isOk" in output && "isErr" in output) {
        // It's a Result type - return as is
        return output;
      }
    }

    // Old pattern: direct value (not Result wrapped)
    // Wrap it in Result.ok()
    return { isOk: () => true, isErr: () => false, value: output } as any;
  } catch (error) {
    // Should not reach here, but handle just in case
    return {
      isOk: () => false,
      isErr: () => true,
      error: error instanceof Error ? error : new Error(String(error)),
    } as any;
  }
}

/**
 * Type guard to check if a value is a Result type
 *
 * @param value - The value to check
 * @returns True if value is a Result type
 */
export function isResultType(value: any): value is Result<any, any> {
  return (
    value &&
    typeof value === "object" &&
    typeof value.isOk === "function" &&
    typeof value.isErr === "function"
  );
}

/**
 * Converts old-pattern executor to new pattern
 *
 * This adapter wraps old executors so they work with the new orchestration:
 * - Old executor: `async (input) => output`
 * - New wrapper: `async (input, ctx) => Result<output, error>`
 *
 * @param oldExecutor - The old-pattern executor
 * @returns New-pattern executor adapter
 */
export function adaptOldExecutorToNew(oldExecutor: any) {
  return async (input: any, ctx: any, config?: any) => {
    try {
      const result = await oldExecutor(input);
      return {
        isOk: () => true,
        isErr: () => false,
        value: result,
      } as any;
    } catch (error) {
      return {
        isOk: () => false,
        isErr: () => true,
        error: error instanceof Error ? error : new Error(String(error)),
      } as any;
    }
  };
}
