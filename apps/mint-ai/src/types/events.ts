import { z } from "zod";

/**
 * ? Event names supported by SSE
 */
export const eventNameSchema = z.enum([
  "run.started",
  "node.started",
  "token",
  "node.finished",
  "run.finished",
  "error",
]);
export type PropEventName = z.infer<typeof eventNameSchema>;

/**
 * ? Base structure for all events
 */
export const baseEventSchema = z.object({
  event: eventNameSchema,
  runId: z.string(),
  nodeId: z.string().optional(), // not every event has a node
  timestamp: z.number(), // epoch ms
});

/**
 * ? Token Event — streaming partial LLM outputs
 */
export const tokenEventSchema = baseEventSchema.extend({
  event: z.literal("token"),
  data: z.string(), // partial token
});
export type PropTokenEvent = z.infer<typeof tokenEventSchema>;

/**
 * ? Node Finished Event
 */
export const nodeFinishedEventSchema = baseEventSchema.extend({
  event: z.literal("node.finished"),
  output: z.unknown(), // node outputs vary by type
});
export type PropNodeFinishedEvent = z.infer<typeof nodeFinishedEventSchema>;

/**
 * ? Run Finished Event
 */
export const runFinishedEventSchema = baseEventSchema.extend({
  event: z.literal("run.finished"),
  result: z.unknown(),
});
export type PropRunFinishedEvent = z.infer<typeof runFinishedEventSchema>;

/**
 * ? Error Event
 */
export const errorEventSchema = baseEventSchema.extend({
  event: z.literal("error"),
  error: z.string(),
});
export type PropErrorEvent = z.infer<typeof errorEventSchema>;

/**
 * ? Union of all events
 */
export const allEventsSchema = z.union([
  tokenEventSchema,
  nodeFinishedEventSchema,
  runFinishedEventSchema,
  errorEventSchema,
]);
export type PropAllEvents = z.infer<typeof allEventsSchema>;
