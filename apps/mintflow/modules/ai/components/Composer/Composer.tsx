"use client";

import type { KeyboardEvent } from "react";

import { MicrophoneIcon } from "@phosphor-icons/react/dist/csr/Microphone";
import { PaperPlaneTiltIcon } from "@phosphor-icons/react/dist/csr/PaperPlaneTilt";
import { Box, Group, Stack, Textarea, UnstyledButton } from "@peppermint/ui";

import { MonoText } from "@/components";
import { tokens } from "@/config/design";

import type { ComposerProps } from "./Composer.types";

/** The bottom composer: auto-growing input, mic (→ voice), and send button. */
export function Composer({
  value,
  onChange,
  onSend,
  onMic,
  pending,
}: ComposerProps) {
  const canSend = value.trim().length > 0 && !pending;

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (canSend) onSend();
    }
  };

  return (
    <Stack gap={8}>
      <Group
        gap={8}
        align="flex-end"
        wrap="nowrap"
        style={{
          background: "#fff",
          border: `1px solid ${tokens.line}`,
          borderRadius: 20,
          padding: "8px 8px 8px 16px",
          boxShadow: "0 1px 0 rgba(0,0,0,0.02), 0 8px 20px rgba(20,30,40,0.06)",
        }}
      >
        <Textarea
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Kamban AI…"
          variant="unstyled"
          autosize
          maxRows={4}
          aria-label="Message Kamban AI"
          style={{ flex: 1, minWidth: 0 }}
          styles={{
            input: { fontSize: 14, lineHeight: 1.45, padding: "6px 0" },
          }}
        />

        <UnstyledButton
          onClick={onMic}
          aria-label="Voice mode"
          style={{
            flex: "0 0 auto",
            width: 40,
            height: 40,
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MicrophoneIcon size={20} color={tokens.ink} />
        </UnstyledButton>

        <UnstyledButton
          onClick={() => canSend && onSend()}
          disabled={!canSend}
          aria-label="Send message"
          style={{
            flex: "0 0 auto",
            width: 40,
            height: 40,
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: canSend ? tokens.accent : "rgba(0,0,0,0.2)",
            cursor: canSend ? "pointer" : "not-allowed",
          }}
        >
          <PaperPlaneTiltIcon size={18} color="#fff" weight="fill" />
        </UnstyledButton>
      </Group>

      <Box style={{ textAlign: "center" }}>
        <MonoText fz="9px" c="rgba(0,0,0,0.3)">
          AI can make mistakes — verify important details.
        </MonoText>
      </Box>
    </Stack>
  );
}
