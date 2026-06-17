"use client";

import { useState } from "react";
import { Paper, Stack, Group, Text, Button, SegmentedControl, ScrollArea, Select, Badge } from "@peppermint/ui";
import { CaretLeftIcon } from "@phosphor-icons/react/dist/csr/CaretLeft";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { WeekView } from "./components/WeekView";
import { MonthView } from "./components/MonthView";
import { ContentPreviewDrawer } from "@/components/ContentPreviewDrawer";
import { fetchCalendarEntries, STATUS_COLORS } from "./calendar.api";
import { calendarQueryKeys } from "./calendar.queryKeys";
import type { CalendarEntry, CalendarViewMode } from "./Calendar.types";
import type { ContentStatus, Platform } from "@/modules/admin/shared/domain.types";

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function formatWeekLabel(start: Date): string {
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
}

function formatMonthLabel(start: Date): string {
  return start.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function Calendar() {
  const [view, setView] = useState<CalendarViewMode>("week");
  const [anchor, setAnchor] = useState(() => new Date());
  const [previewContentId, setPreviewContentId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ContentStatus | null>(null);
  const [filterPlatform, setFilterPlatform] = useState<Platform | null>(null);
  const router = useRouter();

  const periodStart =
    view === "week" ? getWeekStart(anchor) : getMonthStart(anchor);

  const periodEnd = (() => {
    if (view === "week") {
      const d = new Date(periodStart);
      d.setDate(d.getDate() + 6);
      d.setHours(23, 59, 59, 999);
      return d;
    }
    return new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0, 23, 59, 59);
  })();

  const from = periodStart.toISOString().split("T")[0];
  const to = periodEnd.toISOString().split("T")[0];

  const { data: entries = [] } = useQuery({
    queryKey: calendarQueryKeys.entries(from, to, { status: filterStatus, platform: filterPlatform }),
    queryFn: () => fetchCalendarEntries(from, to, {
      status: filterStatus ?? undefined,
      platform: filterPlatform ?? undefined,
    }),
  });

  function navigate(dir: 1 | -1) {
    const d = new Date(anchor);
    if (view === "week") d.setDate(d.getDate() + dir * 7);
    else d.setMonth(d.getMonth() + dir);
    setAnchor(d);
  }

  function handleEntryClick(entry: CalendarEntry) {
    if (entry.contentId) setPreviewContentId(entry.contentId);
  }

  function handleEmptySlotClick(date: Date) {
    router.push(`/admin/create?date=${date.toISOString()}`);
  }

  const periodLabel =
    view === "week" ? formatWeekLabel(periodStart) : formatMonthLabel(periodStart);

  return (
    <Paper p={0} withBorder radius="lg" h="calc(100vh - 16px)" style={{ overflow: "hidden" }}>
      <ScrollArea h="100%">
        <Stack gap="lg" p="lg">
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <Button
                size="xs"
                variant="default"
                onClick={() => setAnchor(new Date())}
              >
                Today
              </Button>
              <Group gap={4}>
                <Button
                  size="xs"
                  variant="subtle"
                  px={6}
                  onClick={() => navigate(-1)}
                  aria-label="Previous period"
                >
                  <CaretLeftIcon size={14} />
                </Button>
                <Button
                  size="xs"
                  variant="subtle"
                  px={6}
                  onClick={() => navigate(1)}
                  aria-label="Next period"
                >
                  <CaretRightIcon size={14} />
                </Button>
              </Group>
              <Text size="sm" fw={500}>
                {periodLabel}
              </Text>
            </Group>
            <SegmentedControl
              value={view}
              onChange={(v) => setView(v as CalendarViewMode)}
              data={[
                { label: "Week", value: "week" },
                { label: "Month", value: "month" },
              ]}
              size="xs"
            />
          </Group>

          {/* Filter bar */}
          <Group gap="sm">
            <Select
              size="xs"
              placeholder="All statuses"
              clearable
              value={filterStatus}
              onChange={(v) => setFilterStatus(v as ContentStatus | null)}
              data={[
                { value: "draft", label: "Draft" },
                { value: "pending_review", label: "Pending Review" },
                { value: "approved", label: "Approved" },
                { value: "scheduled", label: "Scheduled" },
                { value: "published", label: "Published" },
                { value: "failed", label: "Failed" },
              ]}
              style={{ width: 160 }}
            />
            <Select
              size="xs"
              placeholder="All platforms"
              clearable
              value={filterPlatform}
              onChange={(v) => setFilterPlatform(v as Platform | null)}
              data={[
                { value: "instagram", label: "Instagram" },
                { value: "facebook", label: "Facebook" },
                { value: "x", label: "X (Twitter)" },
                { value: "linkedin", label: "LinkedIn" },
                { value: "tiktok", label: "TikTok" },
                { value: "youtube", label: "YouTube" },
                { value: "threads", label: "Threads" },
                { value: "pinterest", label: "Pinterest" },
              ]}
              style={{ width: 160 }}
            />
            {(filterStatus || filterPlatform) && (
              <Button size="xs" variant="subtle" onClick={() => { setFilterStatus(null); setFilterPlatform(null); }}>
                Clear
              </Button>
            )}
          </Group>

          {entries.length === 0 && (
            <Stack align="center" py="xl" gap="xs">
              <Text size="sm" c="dimmed" fw={500}>
                No automation runs scheduled for this period
              </Text>
              <Text size="xs" c="dimmed" ta="center" maw={400}>
                The calendar shows when your automations are scheduled to run and what content they
                generate. It does not control when individual posts go to social networks — that is
                managed by each automation&apos;s schedule.
              </Text>
            </Stack>
          )}

          {view === "week" ? (
            <WeekView
              weekStart={periodStart}
              entries={entries}
              onEntryClick={handleEntryClick}
            />
          ) : (
            <MonthView
              monthStart={periodStart}
              entries={entries}
              onEntryClick={handleEntryClick}
            />
          )}
        </Stack>
      </ScrollArea>

      <ContentPreviewDrawer
        contentId={previewContentId}
        onClose={() => setPreviewContentId(null)}
      />
    </Paper>
  );
}
