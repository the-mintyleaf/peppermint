"use client";

import { Grid, Paper, Stack, Group, Text, Button } from "@peppermint/ui";
import { SparkleIcon } from "@phosphor-icons/react/dist/csr/Sparkle";
import { ChannelSelector } from "../../components/ChannelSelector/ChannelSelector";
import { CaptionEditor } from "../../components/CaptionEditor/CaptionEditor";
import { MediaPanel } from "../../components/MediaPanel/MediaPanel";
import { AiPanel } from "../../components/AiPanel/AiPanel";
import { PlatformPreview } from "../../components/PlatformPreview/PlatformPreview";
import { ComposeActions } from "../../components/ComposeActions/ComposeActions";
import { ValidationBanner } from "../../components/ValidationBanner/ValidationBanner";
import { useComposeStore } from "../../compose.store";
import { ModulePageShell } from "@/modules/admin/shared/ModulePageShell";

const BASE_PATH = "/admin/create";
const MODULE_INFO = {
  name: "compose",
  label: "Compose",
  description: "Create and schedule posts across all your connected channels",
};

export function ComposeEditor() {
  const { aiPanel, openAiPanel } = useComposeStore();

  return (
    <ModulePageShell
      basePath={BASE_PATH}
      moduleInfo={MODULE_INFO}
      disableCreateButton
      actions={
        !aiPanel.open ? (
          <Button
            variant="light"
            size="xs"
            leftSection={<SparkleIcon size={14} />}
            onClick={openAiPanel}
          >
            AI Assistant
          </Button>
        ) : undefined
      }
    >
      <Stack
        gap="md"
        style={{ height: "calc(100vh - 160px)", overflow: "auto" }}
      >
        <ValidationBanner />

        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Stack gap="md">
              <Paper p="md" radius="md" withBorder>
                <Stack gap="sm">
                  <Text size="xs" fw={600} c="dimmed" tt="uppercase">
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

              {aiPanel.open && <AiPanel />}
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
    </ModulePageShell>
  );
}
