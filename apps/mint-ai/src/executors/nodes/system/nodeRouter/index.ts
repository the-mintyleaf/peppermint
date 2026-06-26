import {
  ExecutorContext,
  createExecutorError,
} from "@/shared/executor-context";
import { Result, ok, err } from "@/shared/result";
import { getSessionSummary } from "@/shared/memory/sessionSummary";
import {
  schemaNodeRouterInput,
  PropNodeRouterInput,
  PropNodeRouterOutput,
  NodeRouterConfig,
} from "./nodeRouter.type";

/**
 * System Router Node: evaluates session summary against conditions and returns target node.
 *
 * Conditions are evaluated in order; first match wins.
 * If no condition matches, `config.fallback` is used.
 *
 * Workflow usage:
 *   edges: [
 *     { from: "system.router", to: "agents.checkout" },
 *     { from: "system.router", to: "agents.browse" },
 *   ]
 *
 * The runner checks `output.target` and only enqueues the matching edge.
 */
export const nodeRouter = async (
  input: unknown,
  ctx: ExecutorContext,
  config?: NodeRouterConfig,
): Promise<Result<PropNodeRouterOutput, any>> => {
  const parseResult = schemaNodeRouterInput.safeParse(input);
  if (!parseResult.success) {
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

  if (!config?.conditions?.length || !config.fallback) {
    return err(
      createExecutorError(
        "CONFIG_ERROR",
        "Router node requires conditions and fallback in config",
        {
          nodeId: ctx.nodeId,
          retryable: false,
        },
      ),
    );
  }

  const { sessionId } = parseResult.data;
  const summary = sessionId ? await getSessionSummary(sessionId) : null;

  ctx.logger.debug(
    { event: "router.evaluating", nodeId: ctx.nodeId, sessionId, summary },
    "Evaluating router conditions",
  );

  for (const condition of config.conditions) {
    const allMatch = Object.entries(condition.when).every(
      ([key, value]) => summary?.[key] === value,
    );
    if (allMatch) {
      ctx.logger.info(
        {
          event: "router.matched",
          nodeId: ctx.nodeId,
          target: condition.target,
          when: condition.when,
        },
        "Router condition matched",
      );
      return ok({ target: condition.target, matched: true });
    }
  }

  ctx.logger.info(
    { event: "router.fallback", nodeId: ctx.nodeId, fallback: config.fallback },
    "No router condition matched, using fallback",
  );

  return ok({ target: config.fallback, matched: false });
};
