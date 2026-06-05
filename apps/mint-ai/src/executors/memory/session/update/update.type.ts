import { z } from "zod";
import { schemaMemorySessionMessage } from "@/shared/memory/sessionStore/memorySession.type";

export const schemaNodeSessionUpdateInput = z.object({
  sessionId: z.string(),
  message: schemaMemorySessionMessage,
  maxLen: z.number().min(1).max(100).default(20),
  ttlSec: z.number().min(60).default(3600),
});
export type PropNodeSessionUpdateInput = z.infer<
  typeof schemaNodeSessionUpdateInput
>;

export const schemaNodeSessionUpdateOutput = z.object({
  success: z.boolean(),
});
export type PropNodeSessionUpdateOutput = z.infer<
  typeof schemaNodeSessionUpdateOutput
>;
