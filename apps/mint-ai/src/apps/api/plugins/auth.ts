import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (req: any, reply: any) => Promise<void>;
  }
}

const authPlugin: FastifyPluginAsync = async (app) => {
  app.decorate("authenticate", async (req: any, reply: any) => {
    const auth = req.headers["authorization"];
    if (!auth?.startsWith("Bearer ")) {
      reply.code(401).send({ error: "Unauthorized" });
      return;
    }

    const token = auth.slice("Bearer ".length);

    // TODO: validate with Django
    if (!token || token.length < 10) {
      reply.code(401).send({ error: "Invalid token" });
      return;
    }
  });
};

// ✅ use fastify-plugin wrapper so it decorates the same instance
export default fp(authPlugin, { name: "authPlugin" });
