import type { ChatMessage } from "../../AskAi.types";

export interface MessageThreadProps {
  messages: ChatMessage[];
  /** Whether the assistant reply is in flight (drives the typing indicator). */
  pending: boolean;
}
