"use client";

import Link from "next/link";
import { Anchor, Badge, Group, Stack, Text } from "@peppermint/ui";
import {
  formatDueDate,
  formatDueDistance,
} from "@/modules/admin/reminders/reminders.utils";
import type { ReminderRowViewProps } from "./ReminderRowView.types";

/**
 * One due follow-up.
 *
 * An applicant has a detail route, so the whole row is the link. A client does
 * not — the directory opens records in a drawer from its list — so a
 * client-owned reminder links to that list, the same compromise `LeadRowView`
 * makes for leads.
 */
export function ReminderRowView({
  reminder,
  today,
  tone,
}: ReminderRowViewProps) {
  const href = reminder.applicant
    ? `/admin/applicants/${reminder.applicant}`
    : "/admin/clients";

  return (
    <Anchor component={Link} href={href} underline="never" c="inherit">
      <Group justify="space-between" wrap="nowrap" gap="xs">
        <Stack gap={0} style={{ minWidth: 0 }}>
          <Text size="sm" truncate>
            {reminder.note}
          </Text>
          <Text size="xs" c="dimmed" truncate>
            {reminder.owner_type === "applicant" ? "Applicant" : "Client"} · set
            by {reminder.created_by_username}
          </Text>
        </Stack>
        <Stack gap={2} align="flex-end" style={{ flex: "none" }}>
          {/* Colour plus the word — the badge says how late it is, not just red. */}
          <Badge size="xs" radius="sm" color={tone}>
            {formatDueDistance(reminder.due_date, today)}
          </Badge>
          <Text size="xs" c="dimmed">
            {formatDueDate(reminder.due_date)}
          </Text>
        </Stack>
      </Group>
    </Anchor>
  );
}
