"use client";

import { Stack, Group, Text, Box } from "@peppermint/ui";
import { CalendarEntry } from "../CalendarEntry";
import { ScheduledPopover } from "../ScheduledPopover";
import type { CalendarEntry as CalendarEntryType } from "../../Calendar.types";

interface MonthViewProps {
  monthStart: Date;
  entries: CalendarEntryType[];
  onEntryClick: (entry: CalendarEntryType) => void;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_VISIBLE = 2;

export function MonthView({
  monthStart,
  entries,
  onEntryClick,
}: MonthViewProps) {
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const cells: (Date | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from(
      { length: daysInMonth },
      (_, i) => new Date(year, month, i + 1),
    ),
  ];

  const entriesForDay = (day: Date) =>
    entries.filter((e) => {
      const d = new Date(e.scheduledAt);
      return (
        d.getFullYear() === year &&
        d.getMonth() === month &&
        d.getDate() === day.getDate()
      );
    });

  const today = new Date();

  return (
    <Stack gap={4}>
      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 4,
        }}
      >
        {DAY_NAMES.map((d) => (
          <Text key={d} size="xs" c="dimmed" ta="center" fw={500}>
            {d}
          </Text>
        ))}
      </Box>
      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 4,
        }}
      >
        {cells.map((day, i) => {
          if (!day) return <Box key={`empty-${i}`} style={{ minHeight: 80 }} />;

          const dayEntries = entriesForDay(day);
          const visible = dayEntries.slice(0, MAX_VISIBLE);
          const overflow = dayEntries.length - MAX_VISIBLE;
          const isToday =
            day.getDate() === today.getDate() &&
            day.getMonth() === today.getMonth() &&
            day.getFullYear() === today.getFullYear();

          return (
            <Box
              key={i}
              p={4}
              style={{
                minHeight: 80,
                border: "1px solid var(--mantine-color-default-border)",
                borderRadius: 6,
                background: isToday ? "var(--mantine-color-blue-0)" : undefined,
              }}
            >
              <Text
                size="xs"
                fw={isToday ? 700 : 400}
                c={isToday ? "blue" : undefined}
                mb={4}
              >
                {day.getDate()}
              </Text>
              <Stack gap={2}>
                {visible.map((entry) =>
                  entry.type === "scheduled" ? (
                    <ScheduledPopover key={entry.id} entry={entry}>
                      <div>
                        <CalendarEntry entry={entry} onClick={onEntryClick} />
                      </div>
                    </ScheduledPopover>
                  ) : (
                    <CalendarEntry
                      key={entry.id}
                      entry={entry}
                      onClick={onEntryClick}
                    />
                  ),
                )}
                {overflow > 0 && (
                  <Text size="xs" c="dimmed">
                    +{overflow} more
                  </Text>
                )}
              </Stack>
            </Box>
          );
        })}
      </Box>
    </Stack>
  );
}
