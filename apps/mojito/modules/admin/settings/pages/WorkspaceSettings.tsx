"use client";

import {
  Stack,
  Group,
  Title,
  Text,
  Paper,
  TextInput,
  Select,
  Button,
  Image,
  Skeleton,
} from "@zetsel/ui";
import { useState, useEffect } from "react";
import { notifications } from "@mantine/notifications";
import { useWorkspace, useUpdateWorkspace } from "../settings.hooks";
import type { Workspace } from "../settings.api";

const TIMEZONES = [
  "America/New_York", "America/Chicago", "America/Los_Angeles",
  "Europe/London", "Europe/Paris", "Asia/Tokyo",
];

const INDUSTRIES = ["Technology", "Fashion", "Food & Beverage", "Health & Wellness", "Finance", "Education", "Entertainment", "Retail", "Travel", "Other"];

export function WorkspaceSettings() {
  const { data, isLoading } = useWorkspace();
  const update = useUpdateWorkspace();
  const [draft, setDraft] = useState<Partial<Workspace>>({});

  useEffect(() => { if (data) setDraft(data); }, [data]);

  async function handleSave() {
    await update.mutateAsync(draft);
    notifications.show({ message: "Workspace saved", color: "green" });
  }

  if (isLoading) {
    return <Stack gap="md">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} h={120} radius="md" />)}</Stack>;
  }

  return (
    <Stack gap="md">
      <Paper p="lg" radius="md" withBorder>
        <Group justify="space-between">
          <Stack gap={4}>
            <Title order={3}>Workspace</Title>
            <Text c="dimmed" size="sm">Configure your workspace settings and brand information</Text>
          </Stack>
          <Button size="sm" loading={update.isPending} onClick={handleSave}>Save</Button>
        </Group>
      </Paper>

      <Paper withBorder radius="md" p="md">
        <Stack gap="md">
          {draft.logoUrl && (
            <Image src={draft.logoUrl} alt="Workspace logo" h={40} fit="contain" w="auto" style={{ alignSelf: "flex-start" }} />
          )}
          <TextInput
            label="Logo URL"
            size="sm"
            placeholder="https://…"
            value={draft.logoUrl ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, logoUrl: e.currentTarget.value || undefined }))}
          />
          <TextInput
            label="Workspace Name"
            size="sm"
            value={draft.name ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.currentTarget.value }))}
          />
          <TextInput
            label="Website"
            size="sm"
            placeholder="https://yourbrand.com"
            value={draft.website ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, website: e.currentTarget.value || undefined }))}
          />
          <Select
            label="Industry"
            size="sm"
            data={INDUSTRIES.map((i) => ({ label: i, value: i }))}
            value={draft.industry ?? null}
            onChange={(v) => setDraft((d) => ({ ...d, industry: v ?? d.industry }))}
          />
          <Select
            label="Default Timezone"
            size="sm"
            searchable
            data={TIMEZONES.map((t) => ({ label: t, value: t }))}
            value={draft.timezone ?? null}
            onChange={(v) => setDraft((d) => ({ ...d, timezone: v ?? d.timezone }))}
          />
        </Stack>
      </Paper>
    </Stack>
  );
}
