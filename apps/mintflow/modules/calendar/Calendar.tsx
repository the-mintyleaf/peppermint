"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Group,
  ManageHeader,
  ModalPaper,
  ModuleHeader,
  SegmentedControl,
  Skeleton,
  Stack,
  Text,
  notifications,
} from "@peppermint/ui";
import { ArrowClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowClockwise";
import { CaretLeftIcon } from "@phosphor-icons/react/dist/csr/CaretLeft";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { RowsIcon } from "@phosphor-icons/react/dist/csr/Rows";
import { SquaresFourIcon } from "@phosphor-icons/react/dist/csr/SquaresFour";
import { WarningCircleIcon } from "@phosphor-icons/react/dist/csr/WarningCircle";

import { tokens } from "@/config/design";

import { TaskDetailModal } from "../tasks/kanban/components/TaskDetailModal";
import {
  notConnected,
  tasksForDay,
  useCalendarNav,
  useCalendarTasks,
  useTasksByDay,
} from "./Calendar.hooks";
import {
  formatMonthTitle,
  formatWeekRange,
  REFERENCE_TODAY,
} from "./Calendar.utils";
import { DayTasksModal } from "./components/DayTasksModal";
import { MonthView } from "./components/MonthView";
import { WeekView } from "./components/WeekView";
import type { Task, TaskBoardFilter } from "./module.api";

const BREADCRUMB = [{ label: "Calendar", href: "/calendar" }];
const SUBHEADING =
  "Every task laid out by its due date — see the week ahead and the whole month at a glance.";

const FILTER_SEGMENTS: { value: TaskBoardFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "mine", label: "Mine" },
];

const VIEW_SEGMENTS = [
  {
    value: "month",
    label: (
      <Group gap={6} wrap="nowrap" align="center">
        <SquaresFourIcon size={13} weight="duotone" />
        <span>Month</span>
      </Group>
    ),
  },
  {
    value: "week",
    label: (
      <Group gap={6} wrap="nowrap" align="center">
        <RowsIcon size={13} weight="duotone" />
        <span>Week</span>
      </Group>
    ),
  },
];

export function ModuleCalendar() {
  const [filter, setFilter] = useState<TaskBoardFilter>("all");
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const nav = useCalendarNav();

  const { data: tasks, isLoading, isError, refetch } = useCalendarTasks(filter);
  const { byDay, unscheduled } = useTasksByDay(tasks);

  const title =
    nav.view === "month"
      ? formatMonthTitle(nav.anchor)
      : formatWeekRange(nav.anchor);

  const scheduledCount = useMemo(
    () => (tasks?.length ?? 0) - unscheduled.length,
    [tasks, unscheduled.length],
  );

  const openTask = (task: Task) => {
    setSelectedDay(null);
    setSelectedTask(task);
  };

  return (
    <>
      <ModuleHeader
        breadcrumbItems={BREADCRUMB}
        right={
          <Group gap="xs" mr="sm">
            <Button
              size="xs"
              leftSection={<PlusIcon size={16} aria-label="New task" />}
              onClick={notConnected}
            >
              New Task
            </Button>
          </Group>
        }
      />

      <ModalPaper withBorder>
        <Stack gap={0} h="100%" style={{ overflow: "hidden" }}>
          <Box px="md">
            <ManageHeader
              title="Calendar"
              count={isLoading ? undefined : scheduledCount}
              description={SUBHEADING}
            />
          </Box>

          {/* Toolbar: date navigation (left) + filter / view (right) */}
          <Group justify="space-between" px="md" gap="xs" wrap="wrap">
            <Group gap="xs" wrap="nowrap" align="center">
              <Button.Group>
                <Button
                  variant="default"
                  size="xs"
                  px={8}
                  onClick={nav.prev}
                  aria-label="Previous"
                >
                  <CaretLeftIcon size={14} weight="bold" />
                </Button>
                <Button
                  variant="default"
                  size="xs"
                  onClick={nav.today}
                  disabled={nav.anchor.getTime() === REFERENCE_TODAY.getTime()}
                >
                  Today
                </Button>
                <Button
                  variant="default"
                  size="xs"
                  px={8}
                  onClick={nav.next}
                  aria-label="Next"
                >
                  <CaretRightIcon size={14} weight="bold" />
                </Button>
              </Button.Group>
              <Text fz="15px" fw={700} c={tokens.ink}>
                {title}
              </Text>
            </Group>

            <Group gap={6} wrap="nowrap">
              <SegmentedControl
                value={filter}
                onChange={(v) => setFilter(v as TaskBoardFilter)}
                data={FILTER_SEGMENTS}
                size="xs"
                styles={{ label: { paddingInline: 12 } }}
              />
              <SegmentedControl
                value={nav.view}
                onChange={(v) => nav.setView(v as "month" | "week")}
                data={VIEW_SEGMENTS}
                size="xs"
                styles={{ label: { paddingInline: 10 } }}
              />
            </Group>
          </Group>

          <Box px="md" py="md" style={{ flex: 1, minHeight: 0 }}>
            {isLoading ? (
              <Skeleton height={520} radius="lg" />
            ) : isError || !tasks ? (
              <ErrorState onRetry={() => refetch()} />
            ) : (
              <Stack gap="sm">
                {nav.view === "month" ? (
                  <MonthView
                    anchor={nav.anchor}
                    byDay={byDay}
                    onOpenTask={openTask}
                    onOpenDay={setSelectedDay}
                  />
                ) : (
                  <WeekView
                    anchor={nav.anchor}
                    byDay={byDay}
                    onOpenTask={openTask}
                  />
                )}

                {unscheduled.length > 0 && (
                  <Text ff="monospace" fz="11px" fw={600} c={tokens.muted}>
                    {unscheduled.length} task
                    {unscheduled.length === 1 ? "" : "s"} without a due date —
                    not shown on the calendar.
                  </Text>
                )}
              </Stack>
            )}
          </Box>
        </Stack>
      </ModalPaper>

      <DayTasksModal
        day={selectedDay}
        tasks={selectedDay ? tasksForDay(byDay, selectedDay) : []}
        onClose={() => setSelectedDay(null)}
        onOpenTask={openTask}
      />

      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onEdit={() => {
          notifications.show({ message: "Not connected yet", color: "gray" });
        }}
      />
    </>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Stack align="center" gap={12} py={80}>
      <WarningCircleIcon size={36} weight="duotone" color={tokens.muted2} />
      <Text fz="15px" fw={700} c={tokens.ink}>
        Couldn&rsquo;t load the calendar
      </Text>
      <Text fz="13px" fw={500} c={tokens.muted2} ta="center" maw={320}>
        Something went wrong fetching your tasks. Try again.
      </Text>
      <Button
        variant="light"
        color="accent"
        radius="xl"
        leftSection={<ArrowClockwiseIcon size={15} weight="bold" />}
        onClick={onRetry}
      >
        Retry
      </Button>
    </Stack>
  );
}
