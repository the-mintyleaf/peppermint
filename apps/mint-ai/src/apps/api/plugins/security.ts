import type { FastifyInstance, FastifyPluginCallback } from "fastify";
import "dotenv/config";

/**
 * Security plugin: CORS allow-list + preflight, no extra deps.
 * Follows rules.md: CORS deny by default; allow per tenant via env.
 */
export const securityPlugin: FastifyPluginCallback = (app, _opts, done) => {
  app.addHook("onRequest", (req, _reply, next) => {
    req.log.info({ origin: req.headers.origin }, "CORS check");
    next();
  });

  const raw = process.env.VAGENT_CORS_ORIGINS ?? "";
  const allowList = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const allowNull = process.env.VAGENT_CORS_ALLOW_NULL === "1";

  function isAllowed(originHeader: string | undefined) {
    if (!originHeader) return false;
    if (originHeader === "null") return allowNull; // file:// pages
    return allowList.includes(originHeader);
  }

  app.addHook("onRequest", (req, reply, next) => {
    const origin = req.headers.origin as string | undefined;

    if (isAllowed(origin)) {
      reply.header("Access-Control-Allow-Origin", origin);
      reply.header("Vary", "Origin");
      // We do not use credentials for this public demo; keep it false.
      reply.header("Access-Control-Allow-Credentials", "false");
      reply.header("Access-Control-Allow-Headers", "content-type");
      reply.header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
    }

    // Preflight
    if (req.method === "OPTIONS") {
      reply.code(204).send();
      return;
    }
    next();
  });

  done();
};

// convenience helper
export function registerSecurity(app: FastifyInstance) {
  app.register(securityPlugin);
}
