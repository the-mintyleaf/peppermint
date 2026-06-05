import { z } from "zod";

export const schemaRunEvent = z.object({
  runId: z.string(),
  type: z.enum([
    "run.started",
    "node.started",
    "token",
    "node.finished",
    "run.finished",
    "error",
  ]),
  data: z.unknown().optional(),
});

export type PropRunEvent = z.infer<typeof schemaRunEvent>;
