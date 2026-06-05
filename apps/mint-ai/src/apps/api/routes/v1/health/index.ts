import { FastifyInstance } from "fastify";

// ? Healthcheck route registration
export function routeHealthCheck(app: FastifyInstance) {
  app.get("/v1/healthz", async () => {
    return { status: "ok" };
  });
}
