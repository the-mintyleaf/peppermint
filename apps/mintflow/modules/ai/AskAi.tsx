"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Box, useMutation } from "@peppermint/ui";

import { tokens } from "@/config/design";

import { askKambanAi } from "./AskAi.mutation";
import type { ChatMessage } from "./AskAi.types";
import { ChatHeader, Composer, EmptyState, MessageThread } from "./components";
import classes from "./AskAi.module.css";

let messageSeq = 0;
const nextId = (role: string) => `${role}-${Date.now()}-${(messageSeq += 1)}`;

/**
 * Ask AI — the minister chat screen. A full-height chat surface: sticky header,
 * scrolling message region, and a bottom composer. The assistant is a MOCK —
 * replies come from a canned React Query mutation (`askKambanAi`), whose
 * `isPending` drives the typing indicator. No async data states beyond the
 * mutation pending/success flow (there is no backend to fail against yet).
 */
export function ModuleAskAi() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const mutation = useMutation({ mutationFn: askKambanAi });

  // UI side-effect (not data fetching): keep the newest message in view as the
  // thread grows or the typing indicator appears.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, mutation.isPending]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || mutation.isPending) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { id: nextId("user"), role: "user", content: trimmed },
    ];
    setMessages(nextMessages);
    setInput("");

    mutation.mutate(nextMessages, {
      onSuccess: (reply) =>
        setMessages((prev) => [
          ...prev,
          { id: nextId("assistant"), role: "assistant", content: reply },
        ]),
    });
  };

  const resetThread = () => {
    setMessages([]);
    setInput("");
    mutation.reset();
  };

  return (
    <Box
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: tokens.paper,
      }}
    >
      <ChatHeader onNew={resetThread} />

      <Box
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          padding: "20px 20px 12px",
        }}
      >
        {messages.length === 0 && !mutation.isPending ? (
          <EmptyState onSend={send} />
        ) : (
          <MessageThread messages={messages} pending={mutation.isPending} />
        )}
        <div ref={bottomRef} />
      </Box>

      <Box className={classes.composerRegion}>
        <Composer
          value={input}
          onChange={setInput}
          onSend={() => send(input)}
          onMic={() => router.push("/voice")}
          pending={mutation.isPending}
        />
      </Box>
    </Box>
  );
}
