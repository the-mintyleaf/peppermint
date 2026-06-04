import { FastifyInstance } from "fastify";
import { eventBus } from "@/shared/events/eventBus";
import { schemaRunEvent } from "./stream.type";

export async function routeRunsStream(app: FastifyInstance) {
  app.get<{ Params: { runId: string } }>(
    "/v1/runs/:runId/stream",
    {
      // Note: EventSource API cannot send custom headers
      // So we skip auth for SSE in development
      // In production, use Authorization header in query param or WebSocket
    },
    async (req, reply) => {
      const { runId } = req.params;

      reply.raw.setHeader("Content-Type", "text/event-stream");
      reply.raw.setHeader("Cache-Control", "no-cache");
      reply.raw.setHeader("Connection", "keep-alive");
      reply.raw.flushHeaders?.();

      // ? Function to send events over SSE
      const send = (event: unknown) => {
        try {
          const parsed = schemaRunEvent.parse(event);
          reply.raw.write(`event: ${parsed.type}\n`);
          reply.raw.write(`data: ${JSON.stringify(parsed)}\n\n`);
        } catch (err) {
          // if event doesn't match schema, log & ignore
          req.log.error({ err }, "Invalid event for SSE stream");
        }
      };

      // ? Subscribe this connection to the eventBus
      const unsubscribe = eventBus.subscribe(runId, send);

      // ? Heartbeat every 15s so Postman/browser keep the connection open
      const heartbeat = setInterval(() => {
        reply.raw.write(`event: heartbeat\ndata: {}\n\n`);
      }, 15000);

      // ? Clean up when client disconnects
      req.raw.on("close", () => {
        clearInterval(heartbeat);
        unsubscribe();
      });
    }
  );
}
