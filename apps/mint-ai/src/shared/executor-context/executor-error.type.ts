/**
 * ExecutorError — Standard error hierarchy for executors
 *
 * All executor errors should conform to this structure for:
 * - Consistent error handling in workers
 * - Better debugging and observability
 * - Clear error propagation to clients
 */

export type ExecutorErrorCode =
  | "INVALID_INPUT" // Input validation failed
  | "MISSING_CONTEXT" // Required context missing (sessionId, etc.)
  | "DEPENDENCY_ERROR" // Dependency not available (Redis, LLM, API)
  | "CONFIG_ERROR" // Invalid executor configuration
  | "LLM_ERROR" // LLM API error or parsing failed
  | "TOOL_ERROR" // Tool invocation failed
  | "TIMEOUT" // Execution exceeded time limit
  | "CANCELLED" // Run was cancelled
  | "TOKEN_BUDGET_EXCEEDED" // Token limit reached
  | "RATE_LIMIT" // Rate limit exceeded
  | "UNAUTHORIZED" // Authentication/authorization failed
  | "NOT_FOUND" // Resource not found
  | "CONFLICT" // State conflict
  | "INTERNAL_ERROR" // Unexpected internal error
  | string; // Allow custom codes

export interface ExecutorError {
  /**
   * Error classification
   */
  code: ExecutorErrorCode;

  /**
   * Human-readable error message
   */
  message: string;

  /**
   * Which executor emitted this error
   */
  nodeId?: string;

  /**
   * Optional stack trace
   */
  stack?: string;

  /**
   * Underlying cause
   */
  cause?: Error | any;

  /**
   * Additional context
   */
  context?: Record<string, any>;

  /**
   * Whether error is retryable
   */
  retryable?: boolean;

  /**
   * Suggested retry delay (ms)
   */
  retryDelayMs?: number;

  /**
   * Timestamp
   */
  timestamp?: number;
}

/**
 * Create a standard executor error
 */
export function createExecutorError(
  code: ExecutorErrorCode,
  message: string,
  opts?: {
    nodeId?: string;
    cause?: any;
    stack?: string;
    context?: Record<string, any>;
    retryable?: boolean;
    retryDelayMs?: number;
  },
): ExecutorError {
  return {
    code,
    message,
    nodeId: opts?.nodeId,
    cause: opts?.cause,
    stack: opts?.stack,
    context: opts?.context,
    retryable: opts?.retryable ?? isRetryableError(code),
    retryDelayMs: opts?.retryDelayMs ?? getDefaultRetryDelay(code),
    timestamp: Date.now(),
  };
}

/**
 * Determine if error is retryable
 */
export function isRetryableError(code: ExecutorErrorCode): boolean {
  const retryable = [
    "DEPENDENCY_ERROR", // Redis/API might recover
    "TIMEOUT", // Transient network issue
    "TOOL_ERROR", // API might be temporarily down
    "RATE_LIMIT", // Will recover after backoff
  ];
  return retryable.includes(code);
}

/**
 * Get default retry delay for error type
 */
export function getDefaultRetryDelay(code: ExecutorErrorCode): number {
  const delays: Record<ExecutorErrorCode, number> = {
    INVALID_INPUT: 0, // No retry
    MISSING_CONTEXT: 0,
    DEPENDENCY_ERROR: 1000, // 1s, exponential backoff applied by queue
    CONFIG_ERROR: 0,
    LLM_ERROR: 2000, // LLM might be temporarily overloaded
    TOOL_ERROR: 1500,
    TIMEOUT: 2000,
    CANCELLED: 0,
    TOKEN_BUDGET_EXCEEDED: 0, // Won't help on retry
    RATE_LIMIT: 5000,
    UNAUTHORIZED: 0,
    NOT_FOUND: 0,
    CONFLICT: 0,
    INTERNAL_ERROR: 1000,
  };
  return delays[code] ?? 1000;
}

/**
 * Convert error to ExecutorError
 */
export function toExecutorError(err: any, nodeId?: string): ExecutorError {
  // Already an ExecutorError
  if (err && typeof err === "object" && "code" in err) {
    return err as ExecutorError;
  }

  // JavaScript Error
  if (err instanceof Error) {
    return createExecutorError("INTERNAL_ERROR", err.message, {
      nodeId,
      cause: err,
      stack: err.stack,
    });
  }

  // String
  if (typeof err === "string") {
    return createExecutorError("INTERNAL_ERROR", err, { nodeId });
  }

  // Unknown
  return createExecutorError("INTERNAL_ERROR", JSON.stringify(err), {
    nodeId,
    context: { originalError: err },
  });
}
