"use client";

import { useMemo } from "react";
import { Box } from "@peppermint/ui";

import {
  buildWeekDays,
  dayKey,
  formatWeekdayHead,
  GRID_HEIGHT,
  HOUR_MARKS,
  HOUR_PX,
  hourMarkLabel,
  isReferenceToday,
  packDay,
  taskSlot,
  taskWeight,
  DAY_START_HOUR,
} from "../../Calendar.utils";
import type { Task } from "../../module.api";
import { EventCard } from "./components/EventCard";
import type { WeekGridProps } from "./WeekGrid.types";
import classes from "./WeekGrid.module.css";

const MIN_CARD_PX = 22;
const PX_PER_MIN = HOUR_PX / 60;

function layoutDay(tasks: Task[]) {
  const timed = tasks.map((task) => {
    const slot = taskSlot(task.id, taskWeight(task));
    return { item: task, start: slot.start, end: slot.end };
  });
  return packDay(timed);
}

export function WeekGrid({ anchor, byDay, onOpenTask }: WeekGridProps) {
  const days = useMemo(() => buildWeekDays(anchor), [anchor]);

  return (
    <Box className={classes.wrap}>
      <div className={classes.header}>
        <div className={classes.corner} />
        {days.map((date) => {
          const today = isReferenceToday(date);
          const { weekday, day } = formatWeekdayHead(date);
          return (
            <div
              key={dayKey(date)}
              className={`${classes.headCell} ${today ? classes.headToday : ""}`}
            >
              <span className={classes.weekday}>{weekday}</span>
              <span
                className={`${classes.dayNum} ${today ? classes.dayNumToday : ""}`}
              >
                {day}
              </span>
            </div>
          );
        })}
      </div>

      <div className={classes.body} style={{ height: GRID_HEIGHT }}>
        <div className={classes.gutter}>
          {HOUR_MARKS.map((hour) => (
            <span
              key={hour}
              className={classes.hourLabel}
              style={{ top: (hour - DAY_START_HOUR) * HOUR_PX }}
            >
              {hourMarkLabel(hour)}
            </span>
          ))}
        </div>

        {days.map((date) => {
          const today = isReferenceToday(date);
          const packed = layoutDay(byDay.get(dayKey(date)) ?? []);
          return (
            <div
              key={dayKey(date)}
              className={`${classes.col} ${today ? classes.colToday : ""}`}
            >
              {HOUR_MARKS.map((hour) => (
                <div
                  key={hour}
                  className={classes.hourLine}
                  style={{ top: (hour - DAY_START_HOUR) * HOUR_PX }}
                />
              ))}
              {packed.map((ev) => {
                const top = ev.start * PX_PER_MIN;
                const height = Math.max(
                  (ev.end - ev.start) * PX_PER_MIN,
                  MIN_CARD_PX,
                );
                const widthPct = 100 / ev.lanes;
                return (
                  <EventCard
                    key={ev.item.id}
                    task={ev.item}
                    top={top}
                    height={height}
                    left={`calc(${ev.lane * widthPct}% + 2px)`}
                    width={`calc(${widthPct}% - 4px)`}
                    onOpen={onOpenTask}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </Box>
  );
}
