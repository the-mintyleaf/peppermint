import { FastifyInstance } from "fastify";
import { logger } from "@/shared/logging";
import {
  routeRunsPostInputSchema,
  routeRunsDeepseekOutputSchema,
} from "./deepseek.type";
import { randomUUID } from "node:crypto";
import { runsQueue } from "@/orchestrator/queue";
import { eventBus } from "@/shared/events/eventBus";

export async function routeRunsDeepseek(app: FastifyInstance) {
  app.post("/v1/runs/deepseek", async (request, reply) => {
    const body = routeRunsPostInputSchema.parse(request.body);
    const runId = randomUUID();
    const wfId = "deepseek.reasoning";

    const p = new Promise<any>((resolve, reject) => {
      let timeout: NodeJS.Timeout;
      console.log(`[DEEPSEEK] Setting up listener for runId: ${runId}`);
      const unsub = eventBus.subscribe(runId, (event) => {
        console.log(`[DEEPSEEK] Received event for ${runId}:`, event.type);

        if (event.type === "run.finished") {
          console.log(
            `[DEEPSEEK] Got run.finished for ${runId}, resolving with:`,
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
          console.log(`[DEEPSEEK] Got run.failed for ${runId}`);
          logger.error({ runId, event }, "Deepseek endpoint: run failed");
          clearTimeout(timeout);
          unsub();
          reject(new Error("Workflow execution failed"));
        }
      });

      timeout = setTimeout(() => {
        unsub();
        reject(new Error("Workflow execution timeout"));
      }, 60000);
    });

    await runsQueue.add("start-run", {
      runId,
      workflowId: wfId,
      sessionId: body.sessionId,
      input: body.input,
    });

    try {
      const result = await p;
      console.log("[DEEPSEEK] Final result before parsing:", result);
      const parsed = routeRunsDeepseekOutputSchema.parse(result);
      console.log("[DEEPSEEK] Parsed result:", parsed);
      console.log("[DEEPSEEK] Sending response...");
      return reply.code(200).send(parsed);
    } catch (error) {
      console.error("[DEEPSEEK] Endpoint error:", error);
      logger.error({ runId, error }, "Deepseek endpoint error");
      const message = (error as Error).message;
      return reply.code(500).send({ error: message });
    }
  });
}
