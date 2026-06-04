import { z } from "zod";

export const routeRunsPostInputSchema = z.object({
  workflowId: z.string().optional(), // still keep if needed
  sessionId: z.string(),
  input: z.unknown(),
});

export const routeRunsChatOutputSchema = z.object({
  runId: z.string(),
  reply: z.string(),
  summary: z.record(z.string(), z.string()).optional(),
});
