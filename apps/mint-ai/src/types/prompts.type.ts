import { z } from "zod";

export const schemaSystemPrompt = z.object({
  id: z.string(),
  content: z.string(),
});

export type PropSystemPrompt = z.infer<typeof schemaSystemPrompt>;
