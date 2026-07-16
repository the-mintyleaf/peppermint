import { pickReply } from "./AskAi.data";
import type { ChatMessage } from "./AskAi.types";

/**
 * Send the current thread to the Kamban AI and resolve its reply.
 *
 * MOCK: there is no backend yet, so this returns a canned reply after a short
 * delay. To wire a real endpoint later, replace only this function body with a
 * call through the app `api` instance — the call site does not change:
 *
 *   const { data } = await api.post("/ai/kamban/ask", { messages });
 *   return data.reply;
 */
export async function askKambanAi(messages: ChatMessage[]): Promise<string> {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const reply = pickReply(lastUser?.content ?? "");
  const delayMs = 700 + Math.random() * 400;

  return new Promise((resolve) => {
    setTimeout(() => resolve(reply), delayMs);
  });
}
