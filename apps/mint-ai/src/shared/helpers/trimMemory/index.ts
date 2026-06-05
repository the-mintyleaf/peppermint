import { get_encoding } from "tiktoken";

export async function trimMemoryByTokens(memory: any, maxTokens = 2000) {
  const encoder = get_encoding("cl100k_base");
  const messages = await memory.chatHistory.getMessages();
  let totalTokens = 0;
  const keptMessages = [];

  for (const msg of [...messages].reverse()) {
    const text = typeof msg.content === "string" ? msg.content : "";
    const tokens = encoder.encode(text).length;
    if (totalTokens + tokens > maxTokens) break;
    totalTokens += tokens;
    keptMessages.unshift(msg);
  }

  if ("clear" in memory.chatHistory) await memory.chatHistory.clear();
  for (const m of keptMessages) {
    await memory.chatHistory.addMessage(m);
  }
}
