"use client";

import {
  ActionIcon,
  Group,
  Menu,
  Paper,
  Select,
  Text,
  Textarea,
  Tooltip,
  UnstyledButton,
} from "@zetsel/ui";
import {
  ArrowRightIcon,
  ArrowSquareOutIcon,
  CaretDownIcon,
  PaperclipIcon,
  SparkleIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { ChatInputProps } from "./ChatInput.types";
import styles from "./ChatInput.module.css";

const responseModeOptions = [
  { value: "FastResponse", label: "Fast Response" },
  { value: "SlowResponse", label: "Slow Response" },
] as const;

export function ChatInput({
  onSendMessage,
  isLoading,
  responseMode,
  onResponseModeChange,
  variant = "inline",
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const actionRow = (
    <div className={styles.actionRow}>
      <Group gap={6} wrap="nowrap">
        <UnstyledButton className={styles.chipButton} type="button">
          <PaperclipIcon size={12} weight="regular" />
          <Text size="xs" component="span">
            Attach
          </Text>
        </UnstyledButton>

        {variant === "hero" ? (
          <Menu position="bottom-start" offset={4} width={160}>
            <Menu.Target>
              <UnstyledButton className={styles.chipButton} type="button">
                <Text size="xs" component="span">
                  {responseMode === "FastResponse"
                    ? "Fast Response"
                    : "Slow Response"}
                </Text>
                <CaretDownIcon size={10} weight="bold" />
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              {responseModeOptions.map((option) => (
                <Menu.Item
                  key={option.value}
                  onClick={() => onResponseModeChange(option.value)}
                >
                  <Text size="xs">{option.label}</Text>
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        ) : (
          <Select
            data={[...responseModeOptions]}
            value={responseMode}
            onChange={(val) =>
              onResponseModeChange(val as "FastResponse" | "SlowResponse")
            }
            w={130}
            size="xs"
            variant="default"
            classNames={{ input: styles.selectInput }}
          />
        )}
      </Group>

      <Tooltip label="Send message" withArrow position="top">
        <ActionIcon
          onClick={handleSend}
          disabled={!message.trim() || isLoading}
          size={variant === "hero" ? 28 : "md"}
          radius="xl"
          className={styles.sendButton}
          aria-label="Send message"
        >
          <ArrowRightIcon size={variant === "hero" ? 14 : 18} weight="bold" />
        </ActionIcon>
      </Tooltip>
    </div>
  );

  if (variant === "hero") {
    return (
      <div className={styles.heroRoot}>
        <Paper className={styles.outerCard} radius="lg">
          <div className={styles.topBar}>
            <Text size="xs" className={styles.topBarLabel}>
              Ask Mint AI anything or tell it to do something for you
            </Text>
            <Group gap={4} wrap="nowrap" className={styles.poweredBy}>
              <SparkleIcon
                color="var(--mantine-color-indigo-9)"
                size={12}
                weight="fill"
              />

              <Text size="xs">Powered by Mint AI 1.0</Text>
            </Group>
          </div>

          <div className={styles.innerBox}>
            <Textarea
              placeholder="Type your prompt here..."
              value={message}
              onChange={(e) => setMessage(e.currentTarget.value)}
              onKeyDown={handleKeyDown}
              minRows={4}
              maxRows={10}
              autosize
              variant="unstyled"
              disabled={isLoading}
              classNames={{ input: styles.textareaInput }}
            />
            {actionRow}
          </div>
        </Paper>

        <Group gap={6} justify="center" className={styles.footer}>
          <Text size="xs">or Select from your</Text>
          <UnstyledButton className={styles.savedPromptsButton} type="button">
            <Text size="xs" fw={500}>
              My Saved Prompts
            </Text>
            <ArrowSquareOutIcon size={12} weight="bold" />
          </UnstyledButton>
        </Group>
      </div>
    );
  }

  return (
    <Paper className={styles.inlineContainer} p={4} radius="lg">
      <div className={styles.inlineInnerBox}>
        <Textarea
          placeholder="Type your prompt here..."
          value={message}
          onChange={(e) => setMessage(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          minRows={2}
          maxRows={6}
          autosize
          variant="unstyled"
          disabled={isLoading}
          classNames={{ input: styles.textareaInput }}
        />
        {actionRow}
      </div>
    </Paper>
  );
}
