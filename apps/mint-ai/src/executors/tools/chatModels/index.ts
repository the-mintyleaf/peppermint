import { toolDeepseekChat } from "./deepseek/chat";

async function notImplemented(prompt: string): Promise<string> {
  throw new Error("Model not implemented yet");
}

export const chatModels: Record<any, any> = {
  // * DEEPSEEK
  "deepseek.chat": toolDeepseekChat,
  "deepseek.reasoner": toolDeepseekChat,

  // * OPENAI
  openai: notImplemented,

  // * CLAUDE
  claude: notImplemented,

  // * GEMINI
};
