import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";

export const toolOpenAIGpt4o = new ChatOpenAI({
  model: "gpt-4o",
  temperature: 0.7,
  apiKey: process.env.OPENAI_API_KEY,
});

export const toolOpenAIGpt4oMini = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0.7,
  apiKey: process.env.OPENAI_API_KEY,
});
