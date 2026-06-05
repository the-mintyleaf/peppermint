import { PropSystemPrompt } from "@/types/prompts.type";

export const SYSTEM_PROMPTS: Record<string, PropSystemPrompt> = {
  default: {
    id: "system.default",
    content:
      "You are vAgent, a helpful AI assistant. Reply in valid JSON according to the schema.",
  },
  guard: {
    id: "system.guard",
    content: "You are a strict guard. Validate inputs and deny unsafe content.",
  },
};
