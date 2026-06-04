import Fastify from "fastify";

import { routeV1 } from "./routes/v1";
import authPlugin from "./plugins/auth";
//plugins
import { registerSecurity } from "./plugins/security";

import "dotenv/config";
import "@/orchestrator/worker/index";

// ? Entry point: creates and starts the Fastify server
async function main() {
  const app = Fastify({
    // ? Configure logging (Pino + pretty print + redaction of secrets)
    // logger: {
    //   transport: {
    //     target: "pino-pretty",
    //     options: { colorize: true },
    //   },
    //   redact: {
    //     paths: [
    //       "req.headers.authorization", // ? Hide auth tokens
    //       "req.headers.cookie", // ? Hide cookies
    //       "res.headers['set-cookie']", // ? Hide set-cookie headers
    //       "apiKey", // ? Hide API keys
    //     ],
    //     censor: "[REDACTED]",
    //   },
    // },
  });

  // ? Register auth plugin
  await app.register(authPlugin);

  // ? Hook: attaches unique requestId to each request log (traceability)
  app.addHook("onRequest", async (req, reply) => {
    req.log = req.log.child({ requestId: crypto.randomUUID() });
  });

  // ? Register custom routes (currently just /v1/healthz)
  routeV1.health.healthCheck(app);
  registerSecurity(app);

  app.addHook("onRequest", (req, reply, next) => {
    const origin = req.headers.origin as string | undefined;
    (reply as any).corsOrigin = origin;
    if (req.method === "OPTIONS") {
      reply.code(204).send();
      return;
    }
    next();
  });

  app.addHook("onSend", (req, reply, payload, next) => {
    const origin = (reply as any).corsOrigin;
    if (origin) {
      reply.header("Access-Control-Allow-Origin", origin);
      reply.header("Vary", "Origin");
      reply.header("Access-Control-Allow-Credentials", "false");
      reply.header("Access-Control-Allow-Headers", "content-type");
      reply.header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
    }
    next();
  });
  await routeV1.runs.post(app);
  await routeV1.runs.stream(app);
  await routeV1.runs.chat(app);
  await routeV1.runs.deepseek(app);
  await routeV1.runs.testApi(app);

  // ? Server startup configuration (port from env or fallback to 3000)
  const port = Number(process.env.VAGENT_PORT) || 3000;

  try {
    // ? Start listening on all interfaces (0.0.0.0)
    await app.listen({ port, host: "0.0.0.0" });
    app.log.info(`API running on port ${port}`);
  } catch (err) {
    // ? Log startup errors and exit process
    app.log.error({ err }, "Failed to start server");
    process.exit(1);
  }
}

// ? Kick off the server bootstrap
main();
