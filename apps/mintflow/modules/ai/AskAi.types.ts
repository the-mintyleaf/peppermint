import type { Icon } from "@phosphor-icons/react";

/** Who authored a chat message. */
export type ChatRole = "user" | "assistant";

/** A single message in the Ask-AI thread. */
export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

/** A tappable prompt shown in the empty state. */
export interface Suggestion {
  id: string;
  /** The exact text sent when the suggestion is tapped. */
  text: string;
  /** Background tint of the leading icon square. */
  tint: string;
  /** Foreground color of the leading icon. */
  iconColor: string;
  /** Phosphor icon component. */
  icon: Icon;
}
