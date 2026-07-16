"use client";

import { useMemo } from "react";
import { Box, Text } from "@peppermint/ui";

import {
  buildWeekDays,
  dayKey,
  formatWeekdayHead,
  isReferenceToday,
} from "../../Calendar.utils";
import { EventChip } from "../EventChip";
import type { WeekViewProps } from "./WeekView.types";
import classes from "./WeekView.module.css";

export function WeekView({ anchor, byDay, onOpenTask }: WeekViewProps) {
  const days = useMemo(() => buildWeekDays(anchor), [anchor]);

  return (
    <Box className={classes.grid}>
      {days.map((date) => {
        const today = isReferenceToday(date);
        const { weekday, day } = formatWeekdayHead(date);
        const tasks = byDay.get(dayKey(date)) ?? [];

        return (
          <div key={dayKey(date)} className={classes.col}>
            <div
              className={`${classes.head} ${today ? classes.todayHead : ""}`}
            >
              <span className={classes.weekday}>{weekday}</span>
              <span
                className={`${classes.dayNum} ${today ? classes.todayNum : ""}`}
              >
                {day}
              </span>
            </div>
            <div className={classes.body}>
              {tasks.length === 0 ? (
                <Text component="span" className={classes.empty}>
                  —
                </Text>
              ) : (
                tasks.map((task) => (
                  <EventChip
                    key={task.id}
                    task={task}
                    dense={false}
                    onOpen={onOpenTask}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </Box>
  );
}
