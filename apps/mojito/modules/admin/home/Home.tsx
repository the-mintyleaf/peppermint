"use client";

import {
  Avatar,
  Box,
  Button,
  Group,
  Progress,
  Stack,
  Text,
  Skeleton,
  Badge,
} from "@peppermint/ui";
import { BarChart } from "@peppermint/ui";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/csr/ArrowUpRight";
import { CaretLeftIcon } from "@phosphor-icons/react/dist/csr/CaretLeft";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";
import { LightningIcon } from "@phosphor-icons/react/dist/csr/Lightning";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { ClockIcon } from "@phosphor-icons/react/dist/csr/Clock";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { bentoCardStyle, HOME_COLORS } from "./home.styles";
import { fetchContentItems } from "../content/content.api";
import { contentKeys } from "../content/content.queryKeys";
import { fetchRuns } from "../automation-runs/runs.api";
import { fetchAlerts } from "../listening/listening.api";

const CALENDAR_DAYS = [
  { key: "mon", label: "M" },
  { key: "tue", label: "T" },
  { key: "wed", label: "W" },
  { key: "thu", label: "T" },
  { key: "fri", label: "F" },
  { key: "sat", label: "S" },
  { key: "sun", label: "S" },
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function buildCalendarGrid(year: number, month: number) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

function CalendarCard({ scheduledDates }: { scheduledDates: Set<number> }) {
  const [viewDate, setViewDate] = useState(new Date());
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const calendarWeeks = buildCalendarGrid(year, month);
  const today = new Date();

  function prevMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }
  function nextMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  return (
    <Box style={bentoCardStyle(HOME_COLORS.forest)}>
      <Group justify="space-between" mb="md">
        <Group gap="sm">
          <Box
            style={{
              width: 32, height: 32, borderRadius: "50%",
              background: HOME_COLORS.cream,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <LightningIcon size={16} color={HOME_COLORS.forest} weight="fill" />
          </Box>
          <div>
            <Text c={HOME_COLORS.cream} fw={600} size="sm">Calendar</Text>
            <Text c="rgba(244,245,240,0.6)" size="xs">Scheduled posts</Text>
          </div>
        </Group>
        <ArrowUpRightIcon size={16} color={HOME_COLORS.cream} />
      </Group>

      <Group gap={4} mb="xs" px={4}>
        {CALENDAR_DAYS.map((day) => (
          <Text key={day.key} size="10px" c="rgba(244,245,240,0.5)" style={{ width: 28, textAlign: "center" }}>
            {day.label}
          </Text>
        ))}
      </Group>

      <Stack gap={6}>
        {calendarWeeks.map((week, weekIndex) => (
          <Group key={weekIndex} gap={4} px={4}>
            {week.map((date, dayIndex) => {
              const isToday =
                date !== null &&
                year === today.getFullYear() &&
                month === today.getMonth() &&
                date === today.getDate();
              const hasPost = date !== null && scheduledDates.has(date);
              return (
                <Box
                  key={`${weekIndex}-${dayIndex}`}
                  style={{
                    width: 28, height: 28, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: isToday ? HOME_COLORS.pink : hasPost ? "rgba(244,245,240,0.2)" : "transparent",
                    opacity: date ? 1 : 0,
                    position: "relative",
                  }}
                >
                  {date && (
                    <>
                      <Text size="10px" fw={600} c={HOME_COLORS.cream}>{date}</Text>
                      {hasPost && !isToday && (
                        <Box style={{
                          position: "absolute", bottom: 2, left: "50%",
                          transform: "translateX(-50%)",
                          width: 4, height: 4, borderRadius: "50%",
                          background: HOME_COLORS.yellow,
                        }} />
                      )}
                    </>
                  )}
                </Box>
              );
            })}
          </Group>
        ))}
      </Stack>

      <Group justify="center" gap="lg" mt="lg">
        <Box style={{ cursor: "pointer" }} onClick={prevMonth}>
          <CaretLeftIcon size={14} color={HOME_COLORS.cream} />
        </Box>
        <Text size="xs" c={HOME_COLORS.cream}>
          {viewDate.toLocaleString("default", { month: "long", year: "numeric" })}
        </Text>
        <Box style={{ cursor: "pointer" }} onClick={nextMonth}>
          <CaretRightIcon size={14} color={HOME_COLORS.cream} />
        </Box>
      </Group>
    </Box>
  );
}

interface ScheduleItem {
  time: string;
  title: string;
  platform: string;
  status: string;
}

function ScheduleCard({ items, isLoading }: { items: ScheduleItem[]; isLoading: boolean }) {
  return (
    <Box style={bentoCardStyle(HOME_COLORS.cream)}>
      <Text fw={700} size="lg" c={HOME_COLORS.forest} mb="lg">
        Upcoming Schedule
      </Text>
      {isLoading ? (
        <Stack gap="sm">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} h={80} radius="md" />)}</Stack>
      ) : items.length === 0 ? (
        <Text size="sm" c="dimmed">No upcoming posts</Text>
      ) : (
        <Stack gap="md">
          {items.map((item, i) => (
            <Group key={i} align="flex-start" gap="md" wrap="nowrap">
              <Text size="xs" c="dimmed" w={40} pt={4}>{item.time}</Text>
              <Box
                flex={1}
                p="md"
                style={{
                  borderRadius: 16,
                  background: [HOME_COLORS.orange, HOME_COLORS.purple, HOME_COLORS.pink][i % 3],
                  color: "white",
                  minHeight: 80,
                }}
              >
                <Badge size="xs" variant="white" mb={6}>{item.platform}</Badge>
                <Text fw={600} size="sm" lineClamp={2}>{item.title}</Text>
              </Box>
            </Group>
          ))}
        </Stack>
      )}
    </Box>
  );
}

interface KpiCardProps {
  label: string;
  value: number | string;
  color: string;
  icon: React.ReactNode;
  isLoading?: boolean;
}

function KpiCard({ label, value, color, icon, isLoading }: KpiCardProps) {
  return (
    <Box style={{ ...bentoCardStyle(HOME_COLORS.cream), flex: 1 }}>
      <Group justify="space-between" mb="sm">
        <Text size="xs" c="dimmed" fw={600} tt="uppercase">{label}</Text>
        {icon}
      </Group>
      {isLoading ? <Skeleton h={36} /> : (
        <Text fw={700} size="xl" c={color}>{value}</Text>
      )}
    </Box>
  );
}

function VolumeCard({ data, isLoading }: { data: Array<{ day: string; published: number; draft: number; failed: number }>; isLoading: boolean }) {
  return (
    <Box style={bentoCardStyle(HOME_COLORS.forest)}>
      <Text c={HOME_COLORS.cream} fw={700} size="lg">Content Volume</Text>
      <Text c="rgba(244,245,240,0.6)" size="xs" mb="lg">Last 14 days by status</Text>
      {isLoading ? (
        <Skeleton h={180} />
      ) : (
        <BarChart
          h={180}
          data={data}
          dataKey="day"
          series={[
            { name: "published", color: HOME_COLORS.yellow, label: "Published" },
            { name: "draft", color: "rgba(244,245,240,0.4)", label: "Draft" },
            { name: "failed", color: HOME_COLORS.pink, label: "Failed" },
          ]}
          tickLine="none"
          gridAxis="none"
          withXAxis
          withYAxis={false}
          barProps={{ radius: 6 }}
          type="stacked"
          styles={{
            axis: { stroke: "rgba(244,245,240,0.2)" },
          }}
        />
      )}
    </Box>
  );
}

function ActionBar() {
  const router = useRouter();
  return (
    <Box style={bentoCardStyle(HOME_COLORS.cream)}>
      <Group justify="space-between" wrap="wrap" gap="md">
        <Text fw={600} c={HOME_COLORS.forest}>Quick Actions</Text>
        <Group gap="sm">
          <Button
            size="xs"
            variant="light"
            onClick={() => router.push("/admin/publish/approvals")}
          >
            View Approvals
          </Button>
          <Button
            size="xs"
            color="yellow.6"
            leftSection={<PlusIcon size={14} weight="bold" />}
            styles={{ root: { color: HOME_COLORS.forest, fontWeight: 700 } }}
            onClick={() => router.push("/admin/create")}
          >
            Create Content
          </Button>
        </Group>
      </Group>
    </Box>
  );
}

export function ModuleHome() {
  const { data: contentData, isLoading: contentLoading } = useQuery({
    queryKey: contentKeys.list({}),
    queryFn: () => fetchContentItems({}),
  });

  const { data: runsData } = useQuery({
    queryKey: ["automation-runs", "all"],
    queryFn: () => fetchRuns(),
  });

  const { data: alertsData } = useQuery({
    queryKey: ["alerts"],
    queryFn: fetchAlerts,
  });

  const allContent = contentData?.data ?? [];
  const runs = runsData?.data ?? [];
  const alerts = alertsData ?? [];

  const scheduledItems = allContent
    .filter((c) => c.status === "scheduled" && c.schedule?.scheduledAt)
    .sort((a, b) => new Date(a.schedule!.scheduledAt!).getTime() - new Date(b.schedule!.scheduledAt!).getTime())
    .slice(0, 4);

  const scheduleItems: ScheduleItem[] = scheduledItems.map((c) => ({
    time: c.schedule?.scheduledAt
      ? new Date(c.schedule.scheduledAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
      : "—",
    title: c.title,
    platform: c.variants[0]?.platform ?? "—",
    status: c.status,
  }));

  const scheduledDates = useMemo(() => {
    const set = new Set<number>();
    allContent.forEach((c) => {
      if (c.schedule?.scheduledAt) {
        set.add(new Date(c.schedule.scheduledAt).getDate());
      }
    });
    return set;
  }, [allContent]);

  const publishedCount = allContent.filter((c) => c.status === "published").length;
  const pendingCount = allContent.filter((c) => c.status === "pending_review").length;
  const failedCount = allContent.filter((c) => c.status === "failed").length;
  const activeRuns = runs.filter((r) => r.status === "running").length;
  const unreadAlerts = alerts.filter((a) => !a.read).length;

  const volumeData = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return d;
    });
    return days.map((d) => {
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const dayContent = allContent.filter((c) => {
        const created = new Date(c.createdAt ?? 0);
        return created.toDateString() === d.toDateString();
      });
      return {
        day: dateStr,
        published: dayContent.filter((c) => c.status === "published").length,
        draft: dayContent.filter((c) => c.status === "draft").length,
        failed: dayContent.filter((c) => c.status === "failed").length,
      };
    });
  }, [allContent]);

  return (
    <Box
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(280px, 1fr) minmax(320px, 1.4fr)",
        gridTemplateRows: "auto auto auto auto auto",
        gridTemplateAreas: `
          "calendar schedule"
          "kpis     schedule"
          "volume   volume"
          "action   action"
        `,
        gap: 8,
        minHeight: "100%",
        alignContent: "start",
      }}
    >
      <Box style={{ gridArea: "calendar", minHeight: 360 }}>
        <CalendarCard scheduledDates={scheduledDates} />
      </Box>

      <Box style={{ gridArea: "schedule", minHeight: 420 }}>
        <ScheduleCard items={scheduleItems} isLoading={contentLoading} />
      </Box>

      <Box style={{ gridArea: "kpis" }}>
        <Group gap="xs" align="stretch">
          <KpiCard
            label="Published"
            value={publishedCount}
            color={HOME_COLORS.forest}
            icon={<CheckCircleIcon size={16} color={HOME_COLORS.purple} />}
            isLoading={contentLoading}
          />
          <KpiCard
            label="Pending Review"
            value={pendingCount}
            color={HOME_COLORS.orange}
            icon={<ClockIcon size={16} color={HOME_COLORS.orange} />}
            isLoading={contentLoading}
          />
          <KpiCard
            label="Failed"
            value={failedCount}
            color="red"
            icon={<WarningIcon size={16} color="var(--mantine-color-red-5)" />}
            isLoading={contentLoading}
          />
        </Group>
      </Box>

      <Box style={{ gridArea: "volume", minHeight: 300 }}>
        <VolumeCard data={volumeData} isLoading={contentLoading} />
      </Box>

      <Box style={{ gridArea: "action" }}>
        <ActionBar />
      </Box>
    </Box>
  );
}
