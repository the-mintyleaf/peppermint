"use client";

import { Box, ScrollArea, Stack, Container, Divider } from "@zetsel/ui";
import { v4 as uuidv4 } from "uuid";
import {
  useHomeStore,
  useHomeMessages,
  useHomeChats,
  useActiveChatTitle,
  useActiveChatId,
} from "./home.store";
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

  const {
    isLoading,
    responseMode,
    addMessage,
    setLoading,
    setResponseMode,
    createNewChat,
    selectChat,
    clearAllChats,
  } = useHomeStore();

  const handleSendMessage = async (content: string) => {
    const userMessage = {
      id: uuidv4(),
      role: "user" as const,
      content,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setLoading(true);

    setTimeout(() => {
      const assistantMessage = {
        id: uuidv4(),
        role: "assistant" as const,
        content: `This is a demo response. You said: "${content}". In a real implementation, this would call your AI API.`,
        timestamp: new Date(),
      };
      addMessage(assistantMessage);
      setLoading(false);
    }, 1000);
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

      <Container size="md" className={styles.containerWrapper}>
        {isEmpty ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateGlow} aria-hidden />
            <Stack
              className={styles.emptyStateContent}
              gap="3rem"
              align="center"
            >
              <ChatWelcome userName="Anamol" />
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
                className={styles.messagesArea}
                classNames={{
                  viewport: styles.messagesViewport,
                  content: styles.messagesContent,
                }}
                type="auto"
              >
                <Stack gap="md" p={0} className={styles.messagesList}>
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
