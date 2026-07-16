"use client";

import { useMemo, useState } from "react";
import { Box, Group, Stack, Text, useElementSize } from "@peppermint/ui";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/csr/ArrowUpRight";
import { CaretLeftIcon } from "@phosphor-icons/react/dist/csr/CaretLeft";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";
import { LightningIcon } from "@phosphor-icons/react/dist/csr/Lightning";
import {
  MINI_CALENDAR_COLORS,
  miniCalendarCardStyle,
} from "./miniCalendar.styles";
import type { MiniCalendarProps } from "./MiniCalendar.types";

const CALENDAR_DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const FILTER_CHIPS = ["Yours", "Henky", "Albert", "Richard"];
const PINK_HIGHLIGHT_DATES = new Set([13, 21]);
const MARKED_DATE = 29;
const CELL_GAP = 4;
const COLS = 7;

const calendarGridStyle = {
  display: "grid",
  gridTemplateColumns: `repeat(${COLS}, 1fr)`,
  gap: CELL_GAP,
  width: "100%",
} as const;

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

function findDatePosition(weeks: (number | null)[][], date: number) {
  for (let weekIndex = 0; weekIndex < weeks.length; weekIndex++) {
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      if (weeks[weekIndex][dayIndex] === date) {
        return { weekIndex, dayIndex };
      }
    }
  }
  return null;
}

function getCellSize(containerWidth: number) {
  if (containerWidth <= 0) return 0;
  return (containerWidth - (COLS - 1) * CELL_GAP) / COLS;
}

function cellCenter(weekIndex: number, dayIndex: number, cellSize: number) {
  return {
    x: dayIndex * (cellSize + CELL_GAP) + cellSize / 2,
    y: weekIndex * (cellSize + CELL_GAP) + cellSize / 2,
  };
}

function FilterTabs({
  activeFilter,
  onFilterChange,
}: {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}) {
  return (
    <Stack gap={8} mb="sm">
      <Group gap={4} wrap="nowrap" style={{ overflowX: "auto" }}>
        {FILTER_CHIPS.map((chip) => {
          const isActive = activeFilter === chip;
          return (
            <Box
              key={chip}
              onClick={() => onFilterChange(chip)}
              style={{
                padding: "4px 10px",
                borderRadius: 20,
                cursor: "pointer",
                flexShrink: 0,
                background: isActive
                  ? MINI_CALENDAR_COLORS.textWhite
                  : "transparent",
                border: isActive
                  ? "none"
                  : `1px solid ${MINI_CALENDAR_COLORS.borderMuted}`,
                transition: "background 0.15s ease",
              }}
            >
              <Text
                size="xs"
                fw={600}
                style={{
                  fontSize: "var(--mantine-font-size-xs)",
                  whiteSpace: "nowrap",
                }}
                c={
                  isActive
                    ? MINI_CALENDAR_COLORS.textDark
                    : MINI_CALENDAR_COLORS.textWhite
                }
              >
                {chip}
              </Text>
            </Box>
          );
        })}
      </Group>
      <Group gap={4} justify="center">
        {[0, 1, 2].map((dot) => (
          <Box
            key={dot}
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background:
                dot === 1
                  ? MINI_CALENDAR_COLORS.pink
                  : MINI_CALENDAR_COLORS.textWhite,
              opacity: dot === 1 ? 1 : 0.5,
            }}
          />
        ))}
      </Group>
    </Stack>
  );
}

function HighlightConnector({
  weeks,
  cellSize,
}: {
  weeks: (number | null)[][];
  cellSize: number;
}) {
  const path = useMemo(() => {
    if (cellSize <= 0) return null;

    const start = findDatePosition(weeks, 13);
    const end = findDatePosition(weeks, 21);
    if (!start || !end) return null;

    const from = cellCenter(start.weekIndex, start.dayIndex, cellSize);
    const to = cellCenter(end.weekIndex, end.dayIndex, cellSize);
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2 - cellSize * 0.25;

    return `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`;
  }, [weeks, cellSize]);

  if (!path || cellSize <= 0) return null;

  const width = COLS * cellSize + (COLS - 1) * CELL_GAP;
  const height = weeks.length * cellSize + (weeks.length - 1) * CELL_GAP;

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width,
        height,
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      <path
        d={path}
        fill="none"
        stroke={MINI_CALENDAR_COLORS.pink}
        strokeWidth={Math.max(cellSize * 0.55, 12)}
        strokeLinecap="round"
        opacity={0.85}
      />
    </svg>
  );
}

function DateCell({
  date,
  isPink,
  isMarked,
  isEmpty,
}: {
  date: number | null;
  isPink: boolean;
  isMarked: boolean;
  isEmpty: boolean;
}) {
  return (
    <Box
      style={{
        width: "100%",
        aspectRatio: "1",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        background: isEmpty
          ? "transparent"
          : isPink
            ? MINI_CALENDAR_COLORS.pink
            : MINI_CALENDAR_COLORS.textWhite,
        border: isEmpty
          ? `1.5px dashed ${MINI_CALENDAR_COLORS.dashedEmpty}`
          : "none",
      }}
    >
      {isMarked && (
        <Box
          style={{
            position: "absolute",
            top: "12%",
            left: "12%",
            width: "22%",
            height: "22%",
            borderRadius: "50%",
            background: MINI_CALENDAR_COLORS.textWhite,
            zIndex: 2,
          }}
        />
      )}
      {date && (
        <Text
          size="xs"
          fw={600}
          style={{ fontSize: "var(--mantine-font-size-xs)" }}
          c={
            isPink
              ? MINI_CALENDAR_COLORS.textWhite
              : MINI_CALENDAR_COLORS.textDark
          }
        >
          {date}
        </Text>
      )}
    </Box>
  );
}

export function MiniCalendar({
  activeFilter,
  onFilterChange,
}: MiniCalendarProps) {
  const [viewDate, setViewDate] = useState(new Date(2025, 5, 1));
  const { ref: gridRef, width: gridWidth } = useElementSize();
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const calendarWeeks = buildCalendarGrid(year, month);
  const cellSize = getCellSize(gridWidth);

  const monthLabel = viewDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <Box style={{ ...miniCalendarCardStyle(), width: "100%" }}>
      <Group justify="space-between" align="flex-start" mb="md" wrap="nowrap">
        <Group gap="sm" wrap="nowrap">
          <Box
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: MINI_CALENDAR_COLORS.textWhite,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <LightningIcon
              size={14}
              color={MINI_CALENDAR_COLORS.pink}
              weight="fill"
              aria-label="Calendar"
            />
          </Box>
          <Stack gap={0}>
            <Text
              size="xs"
              fw={700}
              c={MINI_CALENDAR_COLORS.textWhite}
              style={{ fontSize: "var(--mantine-font-size-xs)" }}
            >
              Calendar
            </Text>
            <Text
              size="xs"
              c={MINI_CALENDAR_COLORS.textMuted}
              style={{ fontSize: "var(--mantine-font-size-xs)" }}
            >
              Working days
            </Text>
          </Stack>
        </Group>
        <ArrowUpRightIcon
          size={16}
          color={MINI_CALENDAR_COLORS.textWhite}
          aria-label="Expand"
          style={{ flexShrink: 0, opacity: 0.8 }}
        />
      </Group>

      <FilterTabs activeFilter={activeFilter} onFilterChange={onFilterChange} />

      <Box ref={gridRef} style={{ width: "100%" }}>
        <Box style={{ ...calendarGridStyle, marginBottom: 6 }}>
          {CALENDAR_DAYS.map((day, index) => (
            <Text
              key={`${day}-${index}`}
              size="xs"
              tt="uppercase"
              ta="center"
              c={MINI_CALENDAR_COLORS.textWhite}
              style={{ fontSize: "var(--mantine-font-size-xs)", opacity: 0.85 }}
            >
              {day}
            </Text>
          ))}
        </Box>

        <Box style={{ position: "relative", width: "100%" }}>
          <HighlightConnector weeks={calendarWeeks} cellSize={cellSize} />
          <Stack gap={CELL_GAP} style={{ position: "relative", zIndex: 1 }}>
            {calendarWeeks.map((week, weekIndex) => (
              <Box key={weekIndex} style={calendarGridStyle}>
                {week.map((date, dayIndex) => (
                  <DateCell
                    key={`${weekIndex}-${dayIndex}`}
                    date={date}
                    isPink={date !== null && PINK_HIGHLIGHT_DATES.has(date)}
                    isMarked={date === MARKED_DATE}
                    isEmpty={date === null}
                  />
                ))}
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>

      <Group justify="center" align="center" gap="lg" mt="lg">
        <Box
          style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
          onClick={() =>
            setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
          }
        >
          <CaretLeftIcon
            size={14}
            color={MINI_CALENDAR_COLORS.textWhite}
            aria-label="Previous month"
          />
        </Box>
        <Text
          size="xs"
          fw={700}
          c={MINI_CALENDAR_COLORS.textWhite}
          style={{ fontSize: "var(--mantine-font-size-xs)" }}
        >
          {monthLabel}
        </Text>
        <Box
          style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
          onClick={() =>
            setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
          }
        >
          <CaretRightIcon
            size={14}
            color={MINI_CALENDAR_COLORS.textWhite}
            aria-label="Next month"
          />
        </Box>
      </Group>
    </Box>
  );
}
