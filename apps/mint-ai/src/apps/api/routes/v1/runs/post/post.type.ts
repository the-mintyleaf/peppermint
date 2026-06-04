import { z } from "zod";

// ? Input body schema for POST /runs
export const routeRunsPostInputSchema = z.object({
  workflowId: z.string(),
  sessionId: z.string(),
  input: z.unknown(), // will be validated later per workflow entry node
});

export type PropRouteRunsPostInput = z.infer<typeof routeRunsPostInputSchema>;

// ? Response schema
export const routeRunsPostOutputSchema = z.object({
  runId: z.string().uuid(),
});

export type PropRouteRunsPostOutput = z.infer<typeof routeRunsPostOutputSchema>;
