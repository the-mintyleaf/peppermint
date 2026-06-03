"use client";

import { Box, ScrollArea, Stack, Container } from "@zetsel/ui";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useDashboardStore } from "./dashboard.store";
import { ChatInput } from "./components/ChatInput";
import { ChatMessage } from "./components/ChatMessage";
import { ChatWelcome } from "./components/ChatWelcome";
import { DashboardHeader } from "./components/DashboardHeader";
import styles from "./Dashboard.module.css";

export function ModuleDashboard() {
  const {
    messages,
    isLoading,
    responseMode,
    addMessage,
    setLoading,
    setResponseMode,
    clearMessages,
  } = useDashboardStore();

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

  const handleNewChat = () => {
    clearMessages();
  };

  const handleHistory = () => {
    // TODO: Implement chat history modal/drawer
    console.log('Show chat history');
  };

  const handleClearHistory = () => {
    clearMessages();
  };

  return (
    <Box className={styles.dashboardContainer}>
      <Container size="xl" className={styles.headerSection}>
        <DashboardHeader
          onNewChat={handleNewChat}
          onHistory={handleHistory}
          onClearHistory={handleClearHistory}
        />
      </Container>

      <Container size="md" className={styles.contentSection}>
        <div className={styles.contentWrapper}>
          {messages.length === 0 ? (
            <ChatWelcome userName="Sudhan" />
          ) : (
            <ScrollArea className={styles.messagesArea} type="auto">
              <Stack gap="md" p="md">
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
              </Stack>
            </ScrollArea>
          )}
        </div>

        <div className={styles.inputWrapper}>
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            responseMode={responseMode}
            onResponseModeChange={setResponseMode}
          />
        </div>
      </Container>
    </Box>
  );
}
