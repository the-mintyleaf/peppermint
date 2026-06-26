import { FastifyInstance } from "fastify";
import { logger } from "@/shared/logging";
import {
  routeRunsPostInputSchema,
  routeRunsChatOutputSchema,
} from "./chat.type";
import { randomUUID } from "node:crypto";
import { runsQueue } from "@/orchestrator/queue";
import { eventBus } from "@/shared/events/eventBus";
import { registerSecurity } from "@/apps/api/plugins/security";

// helper: wait for a specific node.finished event for this run
async function waitForNodeFinished(runId: string, nodeId: string) {
  return new Promise<any>((resolve) => {
    const unsubscribe = eventBus.subscribe(runId, (event) => {
      if (event.type === "node.finished" && event.data?.nodeId === nodeId) {
        unsubscribe(); // stop listening once we have what we need
        resolve(event);
      }
    });
  });
}

// ? Route plugin for POST /v1/runs/chat
export async function routeRunsChat(app: FastifyInstance) {
  app.post("/v1/runs/onboarding", async (request, reply) => {
    // Validate request body
    const body = routeRunsPostInputSchema.parse(request.body);

    const runId = randomUUID();
    const wfId = "business.onboarding"; // 👈 use onboarding workflow

    // Promise that resolves when reasoning node finishes
    const p = new Promise((resolve, reject) => {
      const unsub = eventBus.subscribe(runId, (event) => {
        if (
          event.type === "node.finished" &&
          event.data.nodeId === "agents.reasoning"
        ) {
          unsub();
          resolve({
            runId,
            reply: event.data.result.reply,
            summary: event.data.result.summary,
          });
        }
        if (event.type === "run.failed") {
          unsub();
          reject(new Error("Run failed"));
        }
      });
    });

    // Enqueue run
    await runsQueue.add("start-run", {
      runId,
      workflowId: wfId,
      sessionId: body.sessionId,
      input: body.input,
    });

    const result = await p;
    return reply.code(200).send(routeRunsChatOutputSchema.parse(result));
  });

  app.post("/v1/runs/chat", async (request, reply) => {
    const body = routeRunsPostInputSchema.parse(request.body);
    const runId = randomUUID();

    const wfId = "joker.chatbot"; // 👈 use joker chatbot workflow

    // Set up listener BEFORE enqueuing to avoid race condition
    const p = new Promise<any>((resolve, reject) => {
      let timeout: NodeJS.Timeout;
      console.log(`[CHAT] Setting up listener for runId: ${runId}`);
      const unsub = eventBus.subscribe(runId, (event) => {
        console.log(`[CHAT] Received event for ${runId}:`, event.type);

        // Listen for run.finished which contains the final output
        if (event.type === "run.finished") {
          console.log(
            `[CHAT] Got run.finished for ${runId}, resolving with:`,
            event.data?.output,
          );
          clearTimeout(timeout);
          unsub();
          resolve({
            runId,
            reply: event.data?.output?.reply ?? "",
            summary: event.data?.output?.summary,
          });
        }

        if (event.type === "run.failed") {
          console.log(`[CHAT] Got run.failed for ${runId}`);
          logger.error({ runId, event }, "Chat endpoint: run failed");
          clearTimeout(timeout);
          unsub();
          reject(new Error("Workflow execution failed"));
        }
      });

      // Set 60 second timeout to prevent hanging
      timeout = setTimeout(() => {
        unsub();
        reject(
          new Error(
            "Workflow execution timeout - no response from agents.reasoning",
          ),
        );
      }, 60000);
    });

    // Now enqueue the job
    await runsQueue.add("start-run", {
      runId,
      workflowId: wfId,
      sessionId: body.sessionId,
      input: body.input,
    });

    try {
      const result = await p;
      return reply.code(200).send(routeRunsChatOutputSchema.parse(result));
    } catch (error) {
      logger.error({ runId, error }, "Chat endpoint error");
      return reply.code(500).send({ error: (error as Error).message });
    }
  });
}
