import { toolDeepseekChat } from "./deepseek/chat";
import {
  toolClaudeHaiku,
  toolClaudeOpus,
  toolClaudeSonnet,
} from "./claude/chat";
import { toolOpenAIGpt4o, toolOpenAIGpt4oMini } from "./openai/chat";

export const chatModels: Record<string, any> = {
  // DEEPSEEK
  "deepseek.chat": toolDeepseekChat,
  "deepseek.reasoner": toolDeepseekChat,

  // CLAUDE
  "claude.sonnet": toolClaudeSonnet,
  "claude.opus": toolClaudeOpus,
  "claude.haiku": toolClaudeHaiku,

  // OPENAI
  "openai.gpt4o": toolOpenAIGpt4o,
  "openai.gpt4o-mini": toolOpenAIGpt4oMini,
};
