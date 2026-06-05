"use client";

import { Box, ScrollArea, Stack, Container, Divider } from "@zetsel/ui";
import { useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  useHomeStore,
  useHomeMessages,
  useHomeChats,
  useActiveChatTitle,
  useActiveChatId,
  useSessionId,
} from "./home.store";
import { sendDeepseekMessage } from "./home.api";
import { ChatInput } from "./components/ChatInput";
import { ChatMessage } from "./components/ChatMessage";
import { ChatWelcome } from "./components/ChatWelcome";
import { HomeHeader } from "./components/HomeHeader";
import styles from "./Home.module.css";

export function ModuleHome() {
  const messages = useHomeMessages();
  const chats = useHomeChats();
  const currentChatTitle = useActiveChatTitle();
  const activeChatId = useActiveChatId();
  const sessionId = useSessionId();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const {
    isLoading,
    responseMode,
    addMessage,
    updateMessage,
    setLoading,
    setResponseMode,
    createNewChat,
    selectChat,
    clearAllChats,
  } = useHomeStore();

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    const userMessage = {
      id: uuidv4(),
      role: "user" as const,
      content,
      timestamp: new Date(),
    };

    console.log("[Chat] Sending message:", content);
    addMessage(userMessage);
    setLoading(true);

    // Create placeholder for assistant message that will be updated with streaming
    const assistantMessageId = uuidv4();
    let accumulatedText = "";

    try {
      console.log("[Chat] Calling API with sessionId:", sessionId);

      // Add empty placeholder message
      addMessage({
        id: assistantMessageId,
        role: "assistant" as const,
        content: "",
        timestamp: new Date(),
      });

      // Stream the response with typing effect
      const response = await sendDeepseekMessage(
        sessionId,
        content,
        (chunk: string) => {
          accumulatedText += chunk;
          console.log(
            "[Chat] Received chunk, total length:",
            accumulatedText.length,
          );

          // Update message in real-time with streaming effect
          updateMessage(assistantMessageId, accumulatedText);
        },
      );

      console.log("[Chat] API response complete:", response);

      // Ensure final complete message is set
      updateMessage(assistantMessageId, response.reply);
    } catch (error) {
      console.error("[Chat] Error:", error);
      const errorMessage = `Sorry, something went wrong. Please try again. (${(error as Error).message})`;
      updateMessage(assistantMessageId, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <Box className={styles.homeContainer}>
      <HomeHeader
        currentChatTitle={currentChatTitle}
        pastChats={chats.map(({ id, title }) => ({ id, title }))}
        activeChatId={activeChatId}
        onSelectChat={selectChat}
        onNewChat={createNewChat}
        onClearHistory={clearAllChats}
      />

      <Divider />

      <Container size="sm" className={styles.containerWrapper}>
        {isEmpty ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateGlow} aria-hidden />
            <Stack
              className={styles.emptyStateContent}
              gap="3rem"
              align="center"
            >
              <ChatWelcome userName="Admin" />
              <ChatInput
                variant="hero"
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                responseMode={responseMode}
                onResponseModeChange={setResponseMode}
              />
            </Stack>
          </div>
        ) : (
          <>
            <div className={styles.contentWrapper}>
              <ScrollArea
                ref={scrollAreaRef}
                className={styles.messagesArea}
                classNames={{
                  viewport: styles.messagesViewport,
                  content: styles.messagesContent,
                }}
                type="auto"
              >
                <Stack gap="xs" p={0} className={styles.messagesList}>
                  {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                  ))}
                </Stack>
              </ScrollArea>
            </div>
            <div className={styles.inputWrapper}>
              <ChatInput
                variant="inline"
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                responseMode={responseMode}
                onResponseModeChange={setResponseMode}
              />
            </div>
          </>
        )}
      </Container>
    </Box>
  );
}
