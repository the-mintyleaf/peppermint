import { z } from "zod";

export const schemaMemorySessionMessage = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1),
});

export type PropMemorySessionMessage = z.infer<
  typeof schemaMemorySessionMessage
>;

export interface PropStoredMessage {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  tag?: string; // optional, e.g. "summary"
}
