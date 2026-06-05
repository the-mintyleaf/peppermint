import "dotenv/config";
import { ChatDeepSeek } from "@langchain/deepseek";

export const toolDeepseekChat = new ChatDeepSeek({
  model: "deepseek-chat", // or "deepseek-reasoner"
  temperature: 0.7,
  apiKey: process.env.DEEPSEEK_API_KEY,
});
