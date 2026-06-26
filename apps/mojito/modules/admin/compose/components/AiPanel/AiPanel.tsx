"use client";

import {
  Stack,
  Text,
  Button,
  Group,
  Select,
  Textarea,
  Divider,
  Skeleton,
  Paper,
  ActionIcon,
} from "@peppermint/ui";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { SparkleIcon } from "@phosphor-icons/react/dist/csr/Sparkle";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { useComposeStore } from "../../compose.store";
import {
  generateCaption,
  generateVariations,
  suggestHashtags,
  adjustTone,
  adjustLength,
  generateImage,
} from "../../composeAi.api";
import type { Platform } from "@/modules/admin/shared/domain.types";

const TONE_OPTIONS = [
  { value: "casual", label: "Casual" },
  { value: "professional", label: "Professional" },
  { value: "playful", label: "Playful" },
  { value: "educational", label: "Educational" },
];

export function AiPanel() {
  const {
    draft,
    aiPanel,
    setGlobalCaption,
    addMedia,
    closeAiPanel,
    setAiLoading,
  } = useComposeStore();

  const [brief, setBrief] = useState("");
  const [tone, setTone] = useState<string>("casual");
  const [variations, setVariations] = useState<string[]>([]);

  const activePlatform: Platform =
    draft.selectedChannelIds.length > 0 ? "instagram" : "instagram";

  async function runAi(action: () => Promise<void>) {
    setAiLoading(true);
    try {
      await action();
    } catch {
      notifications.show({ message: "AI request failed", color: "red" });
    } finally {
      setAiLoading(false);
    }
  }

  if (!aiPanel.open) return null;

  return (
    <Paper withBorder radius="md" p="md" style={{ position: "relative" }}>
      <ActionIcon
        pos="absolute"
        top={8}
        right={8}
        size="sm"
        variant="subtle"
        onClick={closeAiPanel}
        aria-label="Close AI panel"
      >
        <XIcon size={14} />
      </ActionIcon>

      <Stack gap="md">
        <Group gap="xs">
          <SparkleIcon size={16} />
          <Text fw={600} size="sm">
            AI Assistant
          </Text>
        </Group>

        <Divider />

        <Textarea
          label="Brief"
          placeholder="Describe what this post is about…"
          value={brief}
          onChange={(e) => setBrief(e.currentTarget.value)}
          autosize
          minRows={2}
          maxRows={4}
          size="sm"
        />

        <Select
          label="Tone"
          data={TONE_OPTIONS}
          value={tone}
          onChange={(v) => setTone(v ?? "casual")}
          size="sm"
        />

        {aiPanel.loading ? (
          <Stack gap="xs">
            <Skeleton h={36} radius="sm" />
            <Skeleton h={36} radius="sm" />
            <Skeleton h={36} radius="sm" />
          </Stack>
        ) : (
          <Stack gap="xs">
            <Button
              size="xs"
              variant="light"
              fullWidth
              leftSection={<SparkleIcon size={12} />}
              onClick={() =>
                runAi(async () => {
                  const caption = await generateCaption({
                    platform: activePlatform,
                    brief,
                    tone: tone as
                      | "casual"
                      | "professional"
                      | "playful"
                      | "educational",
                  });
                  setGlobalCaption(caption);
                })
              }
            >
              Generate Caption
            </Button>

            <Button
              size="xs"
              variant="light"
              fullWidth
              disabled={!draft.globalCaption}
              onClick={() =>
                runAi(async () => {
                  const vars = await generateVariations(draft.globalCaption, 3);
                  setVariations(vars);
                })
              }
            >
              Generate Variations
            </Button>

            <Button
              size="xs"
              variant="light"
              fullWidth
              disabled={!draft.globalCaption}
              onClick={() =>
                runAi(async () => {
                  const shorter = await adjustLength(
                    draft.globalCaption,
                    "shorter",
                  );
                  setGlobalCaption(shorter);
                })
              }
            >
              Make Shorter
            </Button>

            <Button
              size="xs"
              variant="light"
              fullWidth
              disabled={!draft.globalCaption}
              onClick={() =>
                runAi(async () => {
                  const longer = await adjustLength(
                    draft.globalCaption,
                    "longer",
                  );
                  setGlobalCaption(longer);
                })
              }
            >
              Make Longer
            </Button>

            <Button
              size="xs"
              variant="light"
              fullWidth
              disabled={!draft.globalCaption}
              onClick={() =>
                runAi(async () => {
                  const adjusted = await adjustTone(
                    draft.globalCaption,
                    tone as
                      | "casual"
                      | "professional"
                      | "playful"
                      | "educational",
                  );
                  setGlobalCaption(adjusted);
                })
              }
            >
              Adjust Tone
            </Button>

            <Button
              size="xs"
              variant="light"
              fullWidth
              onClick={() =>
                runAi(async () => {
                  const url = await generateImage(brief || draft.globalCaption);
                  const { v4: uuidv4 } = await import("uuid");
                  addMedia({
                    id: uuidv4(),
                    url,
                    kind: "image",
                    alt: "AI generated image",
                  });
                })
              }
            >
              Generate Image
            </Button>
          </Stack>
        )}

        {variations.length > 0 && (
          <Stack gap="xs">
            <Divider label="Variations" labelPosition="center" />
            {variations.map((v, i) => (
              <Paper
                key={i}
                p="xs"
                withBorder
                radius="sm"
                style={{ cursor: "pointer" }}
                onClick={() => setGlobalCaption(v)}
              >
                <Text size="xs" lineClamp={3}>
                  {v}
                </Text>
              </Paper>
            ))}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
