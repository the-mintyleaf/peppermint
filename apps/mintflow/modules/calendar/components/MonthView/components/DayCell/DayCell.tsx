"use client";

import { Box, Text, UnstyledButton } from "@peppermint/ui";

import { EventChip } from "../../../EventChip";
import type { DayCellProps } from "./DayCell.types";
import classes from "./DayCell.module.css";

const MAX_VISIBLE = 3;

export function DayCell({
  date,
  inMonth,
  isToday,
  tasks,
  onOpenTask,
  onOpenDay,
}: DayCellProps) {
  const visible = tasks.slice(0, MAX_VISIBLE);
  const overflow = tasks.length - visible.length;

  return (
    <Box
      className={`${classes.cell} ${inMonth ? "" : classes.outMonth} ${
        isToday ? classes.todayCell : ""
      }`}
    >
      <div className={classes.head}>
        <Text
          component="span"
          className={`${classes.dayNum} ${isToday ? classes.today : ""}`}
          c={isToday ? undefined : inMonth ? undefined : "dimmed"}
          opacity={inMonth || isToday ? 1 : 0.55}
        >
          {date.getDate()}
        </Text>
      </div>

      {visible.length > 0 && (
        <div className={classes.events}>
          {visible.map((task) => (
            <EventChip key={task.id} task={task} onOpen={onOpenTask} />
          ))}
          {overflow > 0 && (
            <UnstyledButton
              className={classes.more}
              onClick={() => onOpenDay(date)}
              aria-label={`Show all ${tasks.length} tasks on this day`}
            >
              +{overflow} more
            </UnstyledButton>
          )}
        </div>
      )}
    </Box>
  );
}
