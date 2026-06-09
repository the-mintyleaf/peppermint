// src/orchestrator/runner/advanceWorkflow.ts

import { getWorkflow } from "@/workflows";
import { nodesQueue } from "@/orchestrator/queue";
import { logger } from "@/shared/logging";
import { eventBus } from "@/shared/events/eventBus";

type AdvanceInput = {
  runId: string;
  workflowId: string;
  sessionId: string;
  nodeId: string;
  output?: unknown;
  input?: Record<string, unknown>;
};

// ? Advance workflow after a node finishes
export async function advanceWorkflow({
  runId,
  workflowId,
  sessionId,
  nodeId,
  output,
  input,
}: AdvanceInput) {
  const wf = getWorkflow(workflowId);
  if (!wf) {
    logger.error(
      {
        event: "workflow.error",
        runId,
        workflowId,
        nodeId,
      },
      `Unknown workflow: ${workflowId}`
    );
    throw new Error(`Unknown workflow: ${workflowId}`);
  }

  // Router nodes declare a target node in their output — only follow that edge
  const routerTarget =
    output && typeof output === "object" && "target" in output
      ? (output as { target: string }).target
      : null;

  const successors = wf.edges
    .filter((e) => e.from === nodeId)
    .map((e) => e.to)
    .filter((to) => !routerTarget || to === routerTarget);

  if (successors.length === 0) {
    logger.info(
      {
        event: "run.finished",
        runId,
        workflowId,
        sessionId,
        lastNode: nodeId,
        outputPreview: JSON.stringify(output)?.substring(0, 100),
      },
      "End of workflow reached"
    );

    eventBus.emitEvent({
      runId,
      type: "run.finished",
      data: { lastNode: nodeId, output },
    });

    return;
  }

  for (const next of successors) {
    const nextNode = wf.nodes.find((n) => n.id === next);
    if (!nextNode) {
      logger.error(
        {
          event: "workflow.error",
          runId,
          workflowId,
          sessionId,
          nodeId,
          missingNode: next,
        },
        "Edge points to unknown node"
      );
      continue;
    }

    await nodesQueue.add("node", {
      runId,
      workflowId,
      sessionId,
      nodeId: nextNode.id,
      kind: nextNode.kind,
      input: {
        ...input,
        sessionId,
        prevOutput: output,
      },
      config: nextNode.config ?? {},
    });

    logger.info(
      {
        event: "node.enqueued",
        runId,
        workflowId,
        sessionId,
        fromNode: nodeId,
        toNode: nextNode.id,
        kind: nextNode.kind,
      },
      "Enqueued successor node"
    );
  }
}
