import { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { runsQueue } from "@/orchestrator/queue";
import { logger } from "@/shared/logging";
import {
  routeRunsPostInputSchema,
  routeRunsPostOutputSchema,
} from "./post.type";

// ? Route plugin for POST /v1/runs
export async function routeRunsPost(app: FastifyInstance) {
  app.post("/v1/runs", async (request, reply) => {
    try {
      // ✅ Validate request body
      const body = routeRunsPostInputSchema.parse(request.body);

      // ✅ Generate a new runId
      const runId = randomUUID();

      // ✅ Enqueue workflow run
      await runsQueue.add("start-run", {
        runId,
        workflowId: body.workflowId, // 👈 FIX
        sessionId: body.sessionId, // 👈 FIX
        input: body.input,
      });

      // ✅ Validate + return response
      const response = { runId };
      logger.info(
        {
          event: "run.enqueued",
          runId,
          workflowId: body.workflowId,
          sessionId: body.sessionId,
        },
        "Workflow run enqueued"
      );

      return reply.code(202).send(routeRunsPostOutputSchema.parse(response));
    } catch (err) {
      logger.error(
        {
          event: "run.enqueue_failed",
          err,
        },
        "Failed to enqueue workflow run"
      );

      return reply.status(400).send({ error: "Invalid request" });
    }
  });
}
