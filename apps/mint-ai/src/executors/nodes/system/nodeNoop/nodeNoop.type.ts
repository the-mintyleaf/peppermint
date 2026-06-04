import { z } from "zod";

// ? Input schema for noop executor
export const nodeNoopInputSchema = z.object({
  payload: z.unknown(),
});

// ? Output schema (just echoes back)
export const nodeNoopOutputSchema = z.object({
  echoed: z.unknown(),
});

export type PropNodeNoopInput = z.infer<typeof nodeNoopInputSchema>;
export type PropNodeNoopOutput = z.infer<typeof nodeNoopOutputSchema>;
