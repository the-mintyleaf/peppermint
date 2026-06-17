"use client";

import {
  Stack,
  Group,
  Text,
  Paper,
  Switch,
  Button,
  Skeleton,
} from "@peppermint/ui";
import { useState, useEffect } from "react";
import { notifications } from "@mantine/notifications";
import { useNotificationPrefs, useUpdateNotificationPrefs } from "../settings.hooks";
import type { NotificationPrefs } from "../settings.api";
import { ModulePageShell } from "@/modules/admin/shared/ModulePageShell";

const BASE_PATH = "/admin/settings/notifications";
const MODULE_INFO = { name: "notifications", label: "Notifications" };

function PrefSection({
  title,
  items,
  values,
  onChange,
}: {
  title: string;
  items: Array<{ key: string; label: string; description?: string }>;
  values: Record<string, boolean>;
  onChange: (key: string, val: boolean) => void;
}) {
  return (
    <Paper withBorder radius="md" p="md">
      <Text fw={600} size="sm" mb="sm">{title}</Text>
      <Stack gap="sm">
        {items.map(({ key, label, description }) => (
          <Group key={key} justify="space-between">
            <Stack gap={0}>
              <Text size="sm">{label}</Text>
              {description && <Text size="xs" c="dimmed">{description}</Text>}
            </Stack>
            <Switch
              checked={values[key] ?? false}
              onChange={(e) => onChange(key, e.currentTarget.checked)}
              aria-label={label}
            />
          </Group>
        ))}
      </Stack>
    </Paper>
  );
}

export function NotificationSettings() {
  const { data, isLoading } = useNotificationPrefs();
  const update = useUpdateNotificationPrefs();
  const [draft, setDraft] = useState<NotificationPrefs | null>(null);

  useEffect(() => {
    if (data) setDraft(data);
  }, [data]);

  function updateEmail(key: string, val: boolean) {
    setDraft((d) => (d ? { ...d, email: { ...d.email, [key]: val } } : d));
  }

  function updateInApp(key: string, val: boolean) {
    setDraft((d) => (d ? { ...d, inApp: { ...d.inApp, [key]: val } } : d));
  }

  async function handleSave() {
    if (!draft) return;
    await update.mutateAsync(draft);
    notifications.show({ message: "Preferences saved", color: "green" });
  }

  if (isLoading || !draft) {
    return (
      <ModulePageShell basePath={BASE_PATH} moduleInfo={MODULE_INFO} disableCreateButton>
        <Stack gap="md">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} h={160} radius="md" />)}
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
      <Stack gap="md" style={{ overflow: "auto", height: "calc(100vh - 160px)" }}>
        <PrefSection
          title="Email Notifications"
          items={[
            { key: "approvals", label: "Content approvals", description: "When content is approved or rejected" },
            { key: "mentions", label: "Brand mentions", description: "When your brand is mentioned" },
            { key: "weeklyReport", label: "Weekly report", description: "Summary of your week's performance" },
            { key: "teamActivity", label: "Team activity", description: "When team members take actions" },
            { key: "billing", label: "Billing & invoices", description: "Payment receipts and renewal reminders" },
          ]}
          values={draft.email as unknown as Record<string, boolean>}
          onChange={updateEmail}
        />

        <PrefSection
          title="In-App Notifications"
          items={[
            { key: "approvals", label: "Approvals & reviews" },
            { key: "mentions", label: "Mentions & replies" },
            { key: "automationAlerts", label: "Automation alerts" },
            { key: "publishingFailures", label: "Publishing failures" },
          ]}
          values={draft.inApp as unknown as Record<string, boolean>}
          onChange={updateInApp}
        />
      </Stack>
    </ModulePageShell>
  );
}
