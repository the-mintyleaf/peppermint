"use client";

import {
  Group,
  Button,
  Select,
  Stack,
  Popover,
  DateTimePicker,
  Text,
} from "@peppermint/ui";
import { CalendarIcon } from "@phosphor-icons/react/dist/csr/Calendar";
import { PaperPlaneTiltIcon } from "@phosphor-icons/react/dist/csr/PaperPlaneTilt";
import { FloppyDiskIcon } from "@phosphor-icons/react/dist/csr/FloppyDisk";
import { CopySimpleIcon } from "@phosphor-icons/react/dist/csr/CopySimple";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { useComposeStore } from "../../compose.store";
import { useCreateContent, useScheduleContent, usePublishNow } from "@/modules/admin/content/content.hooks";
import type { ContentItem } from "@/modules/admin/shared/domain.types";

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
];

function buildContentItemFromDraft(draft: ReturnType<typeof useComposeStore>["draft"]): Omit<ContentItem, "id" | "createdAt" | "updatedAt" | "analytics"> {
  return {
    title: draft.title || draft.globalCaption.slice(0, 60) || "Untitled",
    status: "draft",
    source: "manual",
    variants: [],
    schedule: {
      timezone: draft.schedule.timezone ?? "UTC",
    },
    createdBy: "user_123",
  };
}

export function ComposeActions() {
  const { draft, variantEditorStates, reset } = useComposeStore();
  const createContent = useCreateContent();
  const publishNow = usePublishNow();

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const [timezone, setTimezone] = useState("UTC");

  const hasErrors = Object.values(variantEditorStates).some((s) => !s.isValid);
  const hasChannels = draft.selectedChannelIds.length > 0;
  const hasCaption = !!draft.globalCaption;

  async function handleSaveDraft() {
    const data = buildContentItemFromDraft(draft);
    await createContent.mutateAsync({ ...data, status: "draft" });
    reset();
  }

  async function handleSubmitForApproval() {
    const data = buildContentItemFromDraft(draft);
    await createContent.mutateAsync({ ...data, status: "pending_review" });
    reset();
  }

  async function handlePublishNow() {
    const item = await createContent.mutateAsync(buildContentItemFromDraft(draft));
    if (item) {
      await publishNow.mutateAsync(item.id);
      reset();
    }
  }

  async function handleSchedule() {
    if (!scheduledAt) {
      notifications.show({ message: "Pick a date/time first", color: "orange" });
      return;
    }
    const item = await createContent.mutateAsync(buildContentItemFromDraft(draft));
    if (item) {
      const scheduleContent = useScheduleContent();
      await scheduleContent.mutateAsync({ id: item.id, scheduledAt, timezone });
      setScheduleOpen(false);
      reset();
    }
  }

  const isLoading = createContent.isPending || publishNow.isPending;

  return (
    <Group justify="flex-end" gap="sm">
      <Button
        variant="subtle"
        size="sm"
        leftSection={<FloppyDiskIcon size={14} />}
        onClick={handleSaveDraft}
        loading={createContent.isPending}
      >
        Save Draft
      </Button>

      <Button
        variant="light"
        size="sm"
        leftSection={<CopySimpleIcon size={14} />}
        onClick={handleSubmitForApproval}
        disabled={!hasChannels || !hasCaption || hasErrors}
        loading={isLoading}
      >
        Submit for Approval
      </Button>

      <Popover opened={scheduleOpen} onClose={() => setScheduleOpen(false)} width={280} position="top-end">
        <Popover.Target>
          <Button
            variant="light"
            size="sm"
            leftSection={<CalendarIcon size={14} />}
            onClick={() => setScheduleOpen((o) => !o)}
            disabled={!hasChannels || !hasCaption || hasErrors}
          >
            Schedule
          </Button>
        </Popover.Target>
        <Popover.Dropdown>
          <Stack gap="sm">
            <Text size="sm" fw={500}>Schedule Post</Text>
            <DateTimePicker
              label="Date & Time"
              placeholder="Pick date and time"
              value={scheduledAt}
              onChange={setScheduledAt}
              minDate={new Date()}
              size="sm"
            />
            <Select
              label="Timezone"
              data={TIMEZONES}
              value={timezone}
              onChange={(v) => setTimezone(v ?? "UTC")}
              size="sm"
            />
            <Button size="sm" fullWidth onClick={handleSchedule} loading={isLoading}>
              Schedule
            </Button>
          </Stack>
        </Popover.Dropdown>
      </Popover>

      <Button
        size="sm"
        leftSection={<PaperPlaneTiltIcon size={14} />}
        onClick={handlePublishNow}
        disabled={!hasChannels || !hasCaption || hasErrors}
        loading={isLoading}
      >
        Publish Now
      </Button>
    </Group>
  );
}
