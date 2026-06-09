"use client";

import { Stack, Group, Text, Box } from "@zetsel/ui";
import { CalendarEntry } from "../CalendarEntry";
import { ScheduledPopover } from "../ScheduledPopover";
import type { CalendarEntry as CalendarEntryType } from "../../Calendar.types";

interface WeekViewProps {
  weekStart: Date;
  entries: CalendarEntryType[];
  onEntryClick: (entry: CalendarEntryType) => void;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_VISIBLE = 3;

export function WeekView({ weekStart, entries, onEntryClick }: WeekViewProps) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const entriesByDay = (day: Date) =>
    entries.filter((e) => {
      const entryDate = new Date(e.scheduledAt);
      return (
        entryDate.getFullYear() === day.getFullYear() &&
        entryDate.getMonth() === day.getMonth() &&
        entryDate.getDate() === day.getDate()
      );
    });

  const today = new Date();

  return (
    <Box style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
      {days.map((day, i) => {
        const dayEntries = entriesByDay(day);
        const visible = dayEntries.slice(0, MAX_VISIBLE);
        const overflow = dayEntries.length - MAX_VISIBLE;
        const isToday =
          day.getDate() === today.getDate() &&
          day.getMonth() === today.getMonth() &&
          day.getFullYear() === today.getFullYear();

        return (
          <Stack key={i} gap={4} style={{ minHeight: 140 }}>
            <Group gap={4} justify="center">
              <Text size="xs" c="dimmed">
                {DAY_NAMES[day.getDay()]}
              </Text>
              <Text
                size="sm"
                fw={isToday ? 700 : 400}
                c={isToday ? "blue" : undefined}
                style={
                  isToday
                    ? {
                        background: "var(--mantine-color-blue-1)",
                        borderRadius: "50%",
                        width: 24,
                        height: 24,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }
                    : undefined
                }
              >
                {day.getDate()}
              </Text>
            </Group>

            <Stack gap={2}>
              {visible.map((entry) =>
                entry.type === "scheduled" ? (
                  <ScheduledPopover key={entry.id} entry={entry}>
                    <div>
                      <CalendarEntry entry={entry} onClick={onEntryClick} />
                    </div>
                  </ScheduledPopover>
                ) : (
                  <CalendarEntry key={entry.id} entry={entry} onClick={onEntryClick} />
                )
              )}
              {overflow > 0 && (
                <Text size="xs" c="dimmed" ta="center">
                  +{overflow} more
                </Text>
              )}
            </Stack>
          </Stack>
        );
      })}
    </Box>
  );
}
