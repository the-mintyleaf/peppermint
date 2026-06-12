"use client";

import {
  Stack,
  Text,
  TextInput,
  Select,
  Button,
  Avatar,
  Skeleton,
  Group,
} from "@zetsel/ui";
import { useState, useEffect } from "react";
import { notifications } from "@mantine/notifications";
import { useUserProfile, useUpdateUserProfile } from "../settings.hooks";
import type { UserProfile } from "../settings.api";
import { ModulePageShell } from "@/modules/admin/shared/ModulePageShell";

const BASE_PATH = "/admin/settings/profile";
const MODULE_INFO = { name: "profile", label: "Profile" };

const TIMEZONES = [
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Asia/Tokyo", "Asia/Singapore", "Australia/Sydney",
];

export function ProfileSettings() {
  const { data, isLoading } = useUserProfile();
  const update = useUpdateUserProfile();
  const [draft, setDraft] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    if (data) setDraft(data);
  }, [data]);

  async function handleSave() {
    await update.mutateAsync(draft);
    notifications.show({ message: "Profile saved", color: "green" });
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
      {isLoading ? (
        <Stack gap="md">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} h={60} radius="md" />)}
        </Stack>
      ) : (
        <Stack gap="md" maw={600} style={{ overflow: "auto", height: "calc(100vh - 160px)" }}>
          <Group gap="md">
            <Avatar src={draft.avatarUrl} size="xl" radius="xl" />
            <Stack gap="xs">
              <Text size="sm" fw={500}>{draft.name}</Text>
              <TextInput
                size="xs"
                label="Avatar URL"
                placeholder="https://…"
                value={draft.avatarUrl ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, avatarUrl: e.currentTarget.value || undefined }))
                }
                w={300}
              />
            </Stack>
          </Group>
          <TextInput
            label="Full Name"
            size="sm"
            value={draft.name ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.currentTarget.value }))}
          />
          <TextInput
            label="Email"
            size="sm"
            type="email"
            value={draft.email ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, email: e.currentTarget.value }))}
          />
          <Select
            label="Timezone"
            size="sm"
            searchable
            data={TIMEZONES.map((t) => ({ label: t, value: t }))}
            value={draft.timezone ?? null}
            onChange={(v) => setDraft((d) => ({ ...d, timezone: v ?? d.timezone }))}
          />
        </Stack>
      )}
    </ModulePageShell>
  );
}
