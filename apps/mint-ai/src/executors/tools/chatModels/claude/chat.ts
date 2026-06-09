import "dotenv/config";
import { ChatAnthropic } from "@langchain/anthropic";

export const toolClaudeSonnet = new ChatAnthropic({
  model: "claude-sonnet-4-6",
  temperature: 0.7,
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const toolClaudeOpus = new ChatAnthropic({
  model: "claude-opus-4-8",
  temperature: 0.7,
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const toolClaudeHaiku = new ChatAnthropic({
  model: "claude-haiku-4-5-20251001",
  temperature: 0.7,
  apiKey: process.env.ANTHROPIC_API_KEY,
});
