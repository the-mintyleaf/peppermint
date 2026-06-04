import { z } from "zod";
import { schemaMemorySessionMessage } from "@/shared/memory/sessionStore/memorySession.type";

export const schemaNodeSessionFetchInput = z.object({
  sessionId: z.string(),
  limit: z.number().min(1).max(50).default(20),
});
export type PropNodeSessionFetchInput = z.infer<
  typeof schemaNodeSessionFetchInput
>;

export const schemaNodeSessionFetchOutput = z.object({
  messages: z.array(schemaMemorySessionMessage),
});
export type PropNodeSessionFetchOutput = z.infer<
  typeof schemaNodeSessionFetchOutput
>;
