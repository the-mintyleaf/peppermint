import { z } from "zod";

// Input schema for AI Reasoning node
export const schemaNodeAIReasoningInput = z.object({
  sessionId: z.string(),
  message: z.string(),
});
export type PropNodeAIReasoningInput = z.infer<
  typeof schemaNodeAIReasoningInput
>;

// Output schema for AI Reasoning node
export const schemaNodeAIReasoningOutput = z.object({
  reply: z.string(),
  summary: z.record(z.string(), z.string()).optional(),
  // ✅ key: string, value: string
});
export type PropNodeAIReasoningOutput = z.infer<
  typeof schemaNodeAIReasoningOutput
>;
