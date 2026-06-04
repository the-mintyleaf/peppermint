import { z } from "zod";

export const routeRunsPostInputSchema = z.object({
  sessionId: z.string(),
  input: z.unknown(),
});

export const routeRunsDeepseekOutputSchema = z.object({
  runId: z.string(),
  reply: z.string(),
  summary: z.record(z.string(), z.string()).optional(),
});
