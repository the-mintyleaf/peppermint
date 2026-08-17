"use client";

import { useState } from "react";
import Link from "next/link";
import { Anchor, Badge, Group, Stack, Text } from "@peppermint/ui";
import { AlarmIcon } from "@phosphor-icons/react/dist/csr/Alarm";
import {
  formatDueDate,
  formatDueDistance,
} from "@/modules/admin/reminders/reminders.utils";
import type { Reminder } from "@/modules/admin/reminders/reminders.types";
import { useDueReminders } from "../dashboard.hooks";
import { TONE_COLOR, toneForAlert } from "../dashboard.tone";
import { PanelCard } from "./PanelCard";
import { PreviewList } from "./PreviewList";
import { SectionState } from "./SectionState";

/** At most this many rows per view — a summary card, not the worklist itself. */
const PREVIEW_LIMIT = 10;

/**
 * One due follow-up.
 *
 * An applicant has a detail route, so the whole row is the link. A client does
 * not — the directory opens records in a drawer from its list — so a
 * client-owned reminder links to that list, the same compromise `LeadRowView`
 * makes for leads.
 */
function ReminderRowView({
  reminder,
  today,
  tone,
}: {
  reminder: Reminder;
  today: string;
  tone: string;
}) {
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

/**
 * Staff-set follow-ups that are due — the ninth section on a page whose
 * contract has eight.
 *
 * **This card is why the feature works for half the staff.** A `custom_reminder`
 * alert is routed to Admins only, so a Lead Manager's own follow-ups surface
 * nowhere automatically; the reminders contract's §9 names this exact query as
 * the client-side answer. It therefore renders **outside** the
 * `dashboardOperations` gate — putting it inside would hide it from precisely
 * the people who have no other way to see their due work.
 *
 * One request feeds all three views, bucketed against one Nepal-time clock, so
 * the menu counts and the open view can never disagree.
 */
export function RemindersPanel() {
  const [view, setView] = useState("overdue");
  const { buckets, isPending, isError, refetch, isRefetching } =
    useDueReminders();

  const rowsFor = (key: string) => {
    if (key === "today") return buckets.today;
    if (key === "upcoming") return buckets.upcoming;
    return buckets.overdue;
  };

  // Tone is derived from the figure, never chosen here: an empty overdue queue
  // is a good outcome and reads calm, a non-empty one reads breached.
  const toneFor = (key: string) => {
    const count = rowsFor(key).length;
    if (key === "overdue") return toneForAlert(count, "critical");
    if (key === "today") return toneForAlert(count, "warning");
    return toneForAlert(count, "info");
  };

  const VIEWS = [
    {
      value: "overdue",
      label: "Overdue",
      description: "Past their date and still open",
    },
    {
      value: "today",
      label: "Due today",
      description: "Due at the start of today, Nepal time",
    },
    {
      value: "upcoming",
      label: "Upcoming",
      description: "Open follow-ups still ahead of their date",
    },
  ];

  const views = VIEWS.map((entry) => ({
    ...entry,
    count: isPending ? undefined : rowsFor(entry.value).length,
  }));

  const current = rowsFor(view);
  const tone = TONE_COLOR[toneFor(view)];
  const emptyMessage =
    view === "overdue"
      ? "Nothing overdue — every follow-up is on time."
      : view === "today"
        ? "Nothing due today."
        : "No follow-ups scheduled ahead.";

  return (
    <PanelCard
      title="Follow-ups"
      subtitle={VIEWS.find((entry) => entry.value === view)?.description}
      icon={AlarmIcon}
      views={views}
      activeView={view}
      onViewChange={setView}
      minBodyHeight={300}
    >
      <SectionState
        isPending={isPending}
        isError={isError}
        errorMessage="Couldn't load follow-ups."
        onRetry={() => refetch()}
        isRetrying={isRefetching}
        skeletonHeight={300}
      >
        <PreviewList
          rows={current.slice(0, PREVIEW_LIMIT).map((reminder) => (
            <ReminderRowView
              key={reminder.id}
              reminder={reminder}
              today={buckets.todayDate}
              tone={tone}
            />
          ))}
          total={current.length}
          hasMore={current.length > PREVIEW_LIMIT}
          // Reminders have no list route — they live on the record they belong
          // to — so "see all" points at the applicants list rather than
          // inventing a screen. The plain list, never a seeded filter.
          seeAllHref="/admin/applicants"
          emptyMessage={emptyMessage}
          caption={
            buckets.total > buckets.fetched
              ? `Showing the ${buckets.fetched} most recent of ${buckets.total} open reminders. Not narrowed by the fiscal-year or country filters.`
              : "Not narrowed by the fiscal-year or country filters."
          }
        />
      </SectionState>
    </PanelCard>
  );
}
