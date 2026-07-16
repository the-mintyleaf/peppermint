"use client";

import { useMemo } from "react";
import { Box } from "@peppermint/ui";

import {
  buildMonthMatrix,
  dayKey,
  isReferenceToday,
  WEEKDAY_LABELS,
} from "../../Calendar.utils";
import { DayCell } from "./components/DayCell";
import type { MonthViewProps } from "./MonthView.types";
import classes from "./MonthView.module.css";

export function MonthView({
  anchor,
  byDay,
  onOpenTask,
  onOpenDay,
}: MonthViewProps) {
  const cells = useMemo(() => buildMonthMatrix(anchor), [anchor]);

  return (
    <Box className={classes.grid}>
      <div className={classes.weekdays}>
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className={classes.weekday}>
            {label}
          </div>
        ))}
      </div>
      <div className={classes.days}>
        {cells.map((cell) => (
          <DayCell
            key={dayKey(cell.date)}
            date={cell.date}
            inMonth={cell.inMonth}
            isToday={isReferenceToday(cell.date)}
            tasks={byDay.get(dayKey(cell.date)) ?? []}
            onOpenTask={onOpenTask}
            onOpenDay={onOpenDay}
          />
        ))}
      </div>
    </Box>
  );
}
