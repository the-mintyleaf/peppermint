import { ListIcon } from "@phosphor-icons/react/dist/csr/List";
import { NewspaperIcon } from "@phosphor-icons/react/dist/csr/Newspaper";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { BankIcon } from "@phosphor-icons/react/dist/csr/Bank";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";

import { tokens } from "@/config/design";

import type { Suggestion } from "./AskAi.types";

/**
 * The starter prompts shown on the empty Ask-AI screen. Tapping one sends its
 * exact `text` as a user message.
 */
export const suggestions: Suggestion[] = [
  {
    id: "sign-off",
    text: "What needs my sign-off today?",
    tint: tokens.accentSoft,
    iconColor: tokens.accent,
    icon: PencilSimpleIcon,
  },
  {
    id: "risk",
    text: "Brief me on the biggest risk this week",
    tint: tokens.accentSoft,
    iconColor: tokens.accent,
    icon: WarningIcon,
  },
  {
    id: "status",
    text: "One-line status on every active case",
    tint: "rgba(44,110,202,0.12)",
    iconColor: tokens.blueInk,
    icon: ListIcon,
  },
  {
    id: "press",
    text: "Summarise our press exposure by department",
    tint: "rgba(44,110,202,0.12)",
    iconColor: tokens.blueInk,
    icon: NewspaperIcon,
  },
  {
    id: "parliament",
    text: "Prepare talking points for parliament",
    tint: "rgba(16,130,85,0.12)",
    iconColor: "rgb(15,115,75)",
    icon: BankIcon,
  },
];

/**
 * Canned assistant replies, chosen by a simple keyword match on the user's
 * text. Plain text with `\n` line breaks (rendered with `whiteSpace:pre-wrap`).
 * These stand in for a real model response until a backend is wired.
 */
const replies: { keywords: string[]; reply: string }[] = [
  {
    keywords: ["sign-off", "sign off", "signoff", "approve", "approval"],
    reply:
      "Bottom line: 4 items are waiting on your signature, 2 are time-sensitive.\n\n• Grandway procurement award — legal cleared, closes 5pm today.\n• Press statement on the ferry disruption — Comms wants it out before the evening bulletin.\n• Budget reallocation for coastal defence — Finance flagged, no objections.\n• Staff promotion panel results — routine, can wait until tomorrow.\n\nWant me to open the first two for you?",
  },
  {
    keywords: ["risk", "exposure", "threat", "danger"],
    reply:
      "Bottom line: the ferry contract dispute is your largest live risk this week.\n\n• Legal exposure — an unresolved indemnity clause could cost up to £4.2m.\n• Political — the opposition has tabled two written questions.\n• Timing — the operator's deadline lapses Friday; silence reads as agreement.\n\nRecommended move: a holding statement today, decision by Thursday.",
  },
  {
    keywords: ["status", "case", "cases", "active", "update"],
    reply:
      "One line per active case:\n\n• Grandway procurement — on track, award pending your sign-off.\n• Ferry contract — at risk, indemnity clause unresolved.\n• Coastal defence budget — on track, funds reallocated.\n• Border staffing review — slipping, HR is a week behind.\n• Data-sharing MOU — complete, signed Tuesday.",
  },
  {
    keywords: ["press", "media", "news", "journalist", "coverage"],
    reply:
      "Press exposure by department this week:\n\n• Transport — high. Ferry story running across 3 outlets.\n• Finance — moderate. Budget reallocation drew one comment piece.\n• Home Affairs — low. Border review not yet public.\n• Health — quiet. No active threads.\n\nNet: Transport needs a proactive line; the rest can stay reactive.",
  },
  {
    keywords: [
      "parliament",
      "talking point",
      "debate",
      "question time",
      "chamber",
    ],
    reply:
      "Talking points for the chamber:\n\n• Lead with delivery — coastal defence funding secured and reallocated ahead of schedule.\n• On the ferry dispute — confirm a decision by Thursday, avoid pre-empting legal advice.\n• On staffing — acknowledge the border review is running behind and give a firm completion date.\n• Close on data-sharing MOU as a signed, tangible win.\n\nAvoid: numbers on the indemnity claim until legal signs off.",
  },
];

/** Default chief-of-staff briefing when no keyword matches. */
const defaultReply =
  "Bottom line: you're on top of most things — two items need a decision this week.\n\n• Ferry contract dispute is the one live risk; a holding line today buys you until Thursday.\n• 4 items await your sign-off, 2 of them time-sensitive.\n• Press is concentrated in Transport; everything else is quiet.\n\nTell me which thread to open and I'll pull the detail.";

/** Pick a canned reply for the user's latest message by keyword match. */
export function pickReply(text: string): string {
  const lower = text.toLowerCase();
  const match = replies.find((entry) =>
    entry.keywords.some((keyword) => lower.includes(keyword)),
  );
  return match ? match.reply : defaultReply;
}
