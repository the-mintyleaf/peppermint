"use client";

import {
  Grid,
  Paper,
  Stack,
  Group,
  Title,
  Text,
  Button,
  Divider,
} from "@zetsel/ui";
import { SparkleIcon } from "@phosphor-icons/react/dist/csr/Sparkle";
import { ChannelSelector } from "../../components/ChannelSelector/ChannelSelector";
import { CaptionEditor } from "../../components/CaptionEditor/CaptionEditor";
import { MediaPanel } from "../../components/MediaPanel/MediaPanel";
import { AiPanel } from "../../components/AiPanel/AiPanel";
import { PlatformPreview } from "../../components/PlatformPreview/PlatformPreview";
import { ComposeActions } from "../../components/ComposeActions/ComposeActions";
import { ValidationBanner } from "../../components/ValidationBanner/ValidationBanner";
import { useComposeStore } from "../../compose.store";

export function ComposeEditor() {
  const { aiPanel, openAiPanel } = useComposeStore();

  return (
    <Stack gap="md">
      <Paper p="lg" radius="md" withBorder>
        <Group justify="space-between">
          <Stack gap={4}>
            <Title order={3}>Compose</Title>
            <Text c="dimmed" size="sm">
              Create and schedule posts across all your connected channels
            </Text>
          </Stack>
          {!aiPanel.open && (
            <Button
              variant="light"
              size="sm"
              leftSection={<SparkleIcon size={14} />}
              onClick={openAiPanel}
            >
              AI Assistant
            </Button>
          )}
        </Group>
      </Paper>

      <ValidationBanner />

      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Stack gap="md">
            <Paper p="md" radius="md" withBorder>
              <Stack gap="sm">
                <Text size="sm" fw={600} c="dimmed" tt="uppercase" size="xs">
                  Channels
                </Text>
                <ChannelSelector />
              </Stack>
            </Paper>

            <Paper p="md" radius="md" withBorder>
              <CaptionEditor />
            </Paper>

            <Paper p="md" radius="md" withBorder>
              <MediaPanel />
            </Paper>

            {aiPanel.open && (
              <AiPanel />
            )}
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <Stack gap="md">
            <Paper p="md" radius="md" withBorder>
              <PlatformPreview />
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>

      <Paper p="md" radius="md" withBorder>
        <ComposeActions />
      </Paper>
    </Stack>
  );
}
