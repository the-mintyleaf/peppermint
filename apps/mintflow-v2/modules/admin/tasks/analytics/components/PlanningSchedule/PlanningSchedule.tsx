"use client";

import { Box, Divider, Group, Stack, Text } from "@peppermint/ui";
import { ANALYTICS_COLORS, workspaceCardStyle } from "../../taskAnalytics.styles";
import { DashboardHeader } from "../DashboardHeader";
import { AddTaskPlaceholder, ScheduleTaskCard } from "../ScheduleTaskCard";
import type { PlanningScheduleProps } from "./PlanningSchedule.types";

const HOURS = [10, 11, 12, 13, 14, 15];
const HOUR_HEIGHT = 80;
const SCHEDULE_HEIGHT = HOURS.length * HOUR_HEIGHT;

function formatHour(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

export function PlanningSchedule({
  days,
  tasks,
  view,
  onTaskClick,
  selectedMonth,
  onMonthChange,
  onViewChange,
  search,
  onSearchChange,
  teamMembers,
}: PlanningScheduleProps) {
  if (view === "block" || view === "table") {
    return (
      <Box style={{ ...workspaceCardStyle(), minHeight: 480 }}>
        <DashboardHeader
          selectedMonth={selectedMonth}
          onMonthChange={onMonthChange}
          view={view}
          onViewChange={onViewChange}
          search={search}
          onSearchChange={onSearchChange}
          teamMembers={teamMembers}
        />
        <Divider my="md" />
        <Box style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 320 }}>
          <Stack align="center" gap="xs">
            <Text fw={600} c={ANALYTICS_COLORS.textDark}>
              {view === "block" ? "Block" : "Table"} view
            </Text>
            <Text size="xs" c="dimmed">
              Coming soon — switch to Card view for the full schedule
            </Text>
          </Stack>
        </Box>
      </Box>
    );
  }

  return (
    <Box style={{ ...workspaceCardStyle(), minHeight: 480 }}>
      <DashboardHeader
        selectedMonth={selectedMonth}
        onMonthChange={onMonthChange}
        view={view}
        onViewChange={onViewChange}
        search={search}
        onSearchChange={onSearchChange}
        teamMembers={teamMembers}
      />
      <Divider my="md" />
      <Box style={{ display: "grid", gridTemplateColumns: "48px repeat(5, 1fr)", gap: 0 }}>
        <Box />
        {days.map((day) => (
          <Box key={day.date} py="xs" style={{ textAlign: "center" }}>
            <Text fw={700} size="xs" c={ANALYTICS_COLORS.textDark}>
              {day.label}/{day.dayName}
            </Text>
          </Box>
        ))}

        <Box style={{ position: "relative", height: SCHEDULE_HEIGHT }}>
          {HOURS.map((hour) => (
            <Box
              key={hour}
              style={{
                position: "absolute",
                top: (hour - 10) * HOUR_HEIGHT,
                left: 0,
                right: 0,
                height: HOUR_HEIGHT,
                display: "flex",
                alignItems: "flex-start",
                paddingTop: 4,
              }}
            >
              <Text size="xs" c="dimmed" fw={500}>
                {formatHour(hour)}
              </Text>
            </Box>
          ))}
        </Box>

        {days.map((day, dayIndex) => (
          <Box
            key={day.date}
            style={{
              position: "relative",
              height: SCHEDULE_HEIGHT,
              borderLeft: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            {HOURS.map((hour) => (
              <Box
                key={hour}
                style={{
                  position: "absolute",
                  top: (hour - 10) * HOUR_HEIGHT,
                  left: 0,
                  right: 0,
                  height: HOUR_HEIGHT,
                  borderBottom: "1px dashed rgba(0,0,0,0.1)",
                }}
              />
            ))}
            {tasks
              .filter((t) => t.dayIndex === dayIndex)
              .map((task) => (
                <ScheduleTaskCard key={task.id} task={task} onClick={onTaskClick} />
              ))}
            {dayIndex === 4 && (
              <AddTaskPlaceholder dayIndex={4} startHour={14} endHour={15} />
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
