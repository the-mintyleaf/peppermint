"use client";

import {
  Stack,
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
import { ModulePageShell } from "@/modules/admin/shared/ModulePageShell";

const BASE_PATH = "/admin/settings/workspace";
const MODULE_INFO = { name: "workspace", label: "Workspace" };

const TIMEZONES = [
  "America/New_York", "America/Chicago", "America/Los_Angeles",
  "Europe/London", "Europe/Paris", "Asia/Tokyo",
];

const INDUSTRIES = [
  "Technology", "Fashion", "Food & Beverage", "Health & Wellness",
  "Finance", "Education", "Entertainment", "Retail", "Travel", "Other",
];

export function WorkspaceSettings() {
  const { data, isLoading } = useWorkspace();
  const update = useUpdateWorkspace();
  const [draft, setDraft] = useState<Partial<Workspace>>({});

  useEffect(() => {
    if (data) setDraft(data);
  }, [data]);

  async function handleSave() {
    await update.mutateAsync(draft);
    notifications.show({ message: "Workspace saved", color: "green" });
  }

  if (isLoading) {
    return (
      <ModulePageShell basePath={BASE_PATH} moduleInfo={MODULE_INFO} disableCreateButton>
        <Stack gap="md">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} h={120} radius="md" />)}
        </Stack>
      </ModulePageShell>
    );
  }

  return (
    <ModulePageShell
      basePath={BASE_PATH}
      moduleInfo={MODULE_INFO}
      disableCreateButton
      actions={
        <Button size="xs" loading={update.isPending} onClick={handleSave}>Save</Button>
      }
    >
      <Paper withBorder radius="md" p="md" style={{ overflow: "auto", maxHeight: "calc(100vh - 160px)" }}>
        <Stack gap="md">
          {draft.logoUrl && (
            <Image
              src={draft.logoUrl}
              alt="Workspace logo"
              h={40}
              fit="contain"
              w="auto"
              style={{ alignSelf: "flex-start" }}
            />
          )}
          <TextInput
            label="Logo URL"
            size="sm"
            placeholder="https://…"
            value={draft.logoUrl ?? ""}
            onChange={(e) =>
              setDraft((d) => ({ ...d, logoUrl: e.currentTarget.value || undefined }))
            }
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
            onChange={(e) =>
              setDraft((d) => ({ ...d, website: e.currentTarget.value || undefined }))
            }
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
    </ModulePageShell>
  );
}
