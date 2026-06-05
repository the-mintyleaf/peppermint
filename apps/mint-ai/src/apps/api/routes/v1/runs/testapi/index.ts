import { FastifyInstance } from "fastify";
import { runsQueue, nodesQueue } from "@/orchestrator/queue";

export async function routeRunsTest(app: FastifyInstance) {
  app.post("/v1/runs/testapi", async (request, reply) => {
    try {
      const body = request.body as any;

      // Return worker metrics for the UI
      if (body?.action === "metrics" || !body) {
        // Get queue info
        const runsCount = await runsQueue.count();
        const nodesCount = await nodesQueue.count();
        const runsActive = await runsQueue.getActiveCount?.() || 0;
        const nodesActive = await nodesQueue.getActiveCount?.() || 0;

        const metrics = {
          runsQueueDepth: runsCount || 0,
          nodesQueueDepth: nodesCount || 0,
          runsWorkerConcurrency: 5,
          runsWorkerActive: runsActive,
          nodesWorkerConcurrency: 10,
          nodesWorkerActive: nodesActive,
          totalRunsProcessed: 0, // Would need to track this separately
          totalNodesProcessed: 0, // Would need to track this separately
          avgRunDuration: 0,
          avgNodeDuration: 0,
        };

        return reply.code(200).send(metrics);
      }

      return reply.code(400).send({ error: "Invalid request" });
    } catch (error) {
      console.error("testapi error:", error);
      return reply.code(500).send({ error: "Failed to get metrics" });
    }
  });
}
