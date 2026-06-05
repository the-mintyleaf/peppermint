// src/shared/logging.ts
import pino from "pino";
import "dotenv/config";

const transport =
  process.env.NODE_ENV === "production"
    ? pino.transport({
        target: "pino/file",
        options: {
          destination: `${process.env.VAGENT_LOG_PATH || "./logs"}/app.log`,
          mkdir: true, // auto-create logs dir
        },
      })
    : pino.transport({
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss.l",
          singleLine: false,
          levelFirst: true,
          messageFormat: "{msg}",
          ignore: "hostname,pid",
        },
      });

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || "info",
    redact: {
      paths: [
        "req.headers.authorization",
        "req.headers.cookie",
        "res.headers['set-cookie']",
        "apiKey",
      ],
      censor: "[REDACTED]",
    },
  },
  transport
);
