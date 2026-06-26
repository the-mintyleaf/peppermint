"use client";

import { useState } from "react";
import { Box, Text } from "@peppermint/ui";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import { CATEGORY_LABELS } from "../../../kanban/module.api";
import type {
  Task,
  TaskCategory,
  TaskSubtask,
} from "../../../kanban/module.api";
import type { DisplayStatus } from "../../GeneralViewDashboard.hooks";
import type { ProgressBarProps, TaskListRowProps } from "./TaskListRow.types";
import tableClasses from "../../TaskTable.module.css";

const CATEGORY_SHORT: Record<TaskCategory, string> = {
  document_review: "Doc Review",
  review: "Review",
  approval: "Approval",
  general: "General",
};

function ProgressBar({ pct, color, striped }: ProgressBarProps) {
  return (
    <Box className={tableClasses.bar}>
      <Box
        className={
          striped
            ? `${tableClasses.barFill} ${tableClasses.barFillStriped}`
            : tableClasses.barFill
        }
        style={{
          width: `${Math.max(0, Math.min(100, pct))}%`,
          backgroundColor: striped ? undefined : color,
        }}
      />
    </Box>
  );
}

function parseDate(value: string): Date | null {
  const iso = new Date(value);
  if (!isNaN(iso.getTime())) return iso;
  const parsed = new Date(Date.parse(value));
  return isNaN(parsed.getTime()) ? null : parsed;
}

function getStatusTracking(task: Task, displayStatus: DisplayStatus) {
  const total = task.subtasks?.length ?? 0;
  const completed =
    task.subtasks?.filter((s) => s.status === "completed").length ?? 0;
  const left = total - completed;
  const pct = total > 0 ? (completed / total) * 100 : 0;

  let barColor = "var(--mantine-color-blue-5)";
  let striped = false;
  if (displayStatus === "ready_for_review")
    barColor = "var(--mantine-color-green-5)";
  if (displayStatus === "in_review") {
    barColor = "var(--mantine-color-green-5)";
    striped = true;
  }
  if (displayStatus === "rejected") barColor = "var(--mantine-color-red-5)";

  return { pct, barColor, striped, total, left };
}

function getStatusActionLabel(
  task: Task,
  displayStatus: DisplayStatus,
  left: number,
): string {
  switch (displayStatus) {
    case "in_progress":
      return left > 0 ? `Continue (${left} left)` : "Continue";
    case "ready_for_review":
      return "Ready for review";
    case "in_review": {
      const reviewers = task.assignees?.length ?? 1;
      const seen = task.requestStatus?.includes("Seen")
        ? reviewers
        : reviewers > 1
          ? 1
          : 0;
      const unseen = reviewers - seen;
      return `Review in progress (${seen} seen / ${unseen} unseen)`;
    }
    case "rejected":
      return "View rejection";
    default:
      return left > 0 ? `Start (${left})` : "Start";
  }
}

function getDeadline(task: Task) {
  if (!task.endDate) return null;
  const end = parseDate(task.endDate);
  if (!end) return null;

  const now = new Date();
  const daysLeft = Math.ceil((end.getTime() - now.getTime()) / 86400000);
  const formatted = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  let totalDays = 30;
  if (task.startDate) {
    const start = parseDate(task.startDate);
    if (start)
      totalDays = Math.max(
        1,
        Math.ceil((end.getTime() - start.getTime()) / 86400000),
      );
  }

  const remainingPct =
    daysLeft < 0 ? 0 : Math.min(100, (daysLeft / totalDays) * 100);

  let urgency: string;
  let urgencyColor: string;
  if (daysLeft < 0) {
    urgency = "Overdue";
    urgencyColor = "red";
  } else if (daysLeft <= 7) {
    urgency = "Due soon";
    urgencyColor = "orange";
  } else {
    urgency = "On track";
    urgencyColor = "dimmed";
  }

  const barColor =
    daysLeft < 0
      ? "var(--mantine-color-red-5)"
      : daysLeft <= 7
        ? "var(--mantine-color-orange-5)"
        : "var(--mantine-color-teal-5)";

  return { remainingPct, barColor, formatted, urgency, urgencyColor };
}

function getSubtaskDeadline(dueDate: string, parentStart?: string) {
  const end = parseDate(dueDate);
  if (!end) return null;

  const now = new Date();
  const daysLeft = Math.ceil((end.getTime() - now.getTime()) / 86400000);
  const formatted = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  let totalDays = 14;
  if (parentStart) {
    const start = parseDate(parentStart);
    if (start)
      totalDays = Math.max(
        1,
        Math.ceil((end.getTime() - start.getTime()) / 86400000),
      );
  }

  const remainingPct =
    daysLeft < 0 ? 0 : Math.min(100, (daysLeft / totalDays) * 100);
  const barColor =
    daysLeft < 0
      ? "var(--mantine-color-red-5)"
      : daysLeft <= 3
        ? "var(--mantine-color-orange-5)"
        : "var(--mantine-color-teal-5)";

  const urgency =
    daysLeft < 0 ? "Overdue" : daysLeft <= 3 ? "Due soon" : "On track";
  const urgencyColor =
    daysLeft < 0 ? "red" : daysLeft <= 3 ? "orange" : "dimmed";

  return { remainingPct, barColor, formatted, urgency, urgencyColor };
}

function getSubtaskTracking(subtask: TaskSubtask) {
  const pct =
    subtask.status === "completed"
      ? 100
      : subtask.status === "in_progress"
        ? 50
        : 0;
  const barColor =
    subtask.status === "completed"
      ? "var(--mantine-color-green-5)"
      : subtask.status === "in_progress"
        ? "var(--mantine-color-blue-5)"
        : "var(--mantine-color-gray-4)";
  const label =
    subtask.status === "completed"
      ? "Done"
      : subtask.status === "in_progress"
        ? "In progress"
        : "Pending";
  return { pct, barColor, label };
}

function assigneeNames(task: Task): string {
  const list = task.assignees ?? [
    { name: task.assignee, initials: "", color: "" },
  ];
  if (list.length === 0) return "—";
  return list.map((a) => a.name).join(", ");
}

function TrackingCell({
  pct,
  barColor,
  striped,
  label,
  total,
  active,
}: {
  pct: number;
  barColor: string;
  striped?: boolean;
  label: string;
  total?: number;
  active?: boolean;
}) {
  return (
    <div className={tableClasses.trackingCell}>
      <ProgressBar pct={pct} color={barColor} striped={striped} />
      <div className={tableClasses.trackingMeta}>
        <span
          className={`${tableClasses.actionLabel} ${active ? tableClasses.actionLabelActive : tableClasses.actionLabelMuted}`}
        >
          {label} ›
        </span>
        {total != null && total > 0 && (
          <span className={tableClasses.count}>{total}</span>
        )}
      </div>
    </div>
  );
}

function DeadlineCell({
  deadline,
  fallback,
}: {
  deadline: ReturnType<typeof getDeadline>;
  fallback?: string;
}) {
  if (!deadline) {
    return <span className={tableClasses.cellText}>{fallback ?? "—"}</span>;
  }
  return (
    <div className={tableClasses.deadlineCell}>
      <ProgressBar pct={deadline.remainingPct} color={deadline.barColor} />
      <div className={tableClasses.deadlineMeta}>
        <span className={tableClasses.cellText}>{deadline.formatted}</span>
        <Text component="span" size="xs" c={deadline.urgencyColor}>
          · {deadline.urgency}
        </Text>
      </div>
    </div>
  );
}

function SubtaskRow({
  subtask,
  index,
  parentAssignees,
  parentStart,
}: {
  subtask: TaskSubtask;
  index: number;
  parentAssignees: string;
  parentStart?: string;
}) {
  const tracking = getSubtaskTracking(subtask);
  const deadline = getSubtaskDeadline(subtask.dueDate, parentStart);

  return (
    <Box
      className={`${tableClasses.grid} ${tableClasses.row} ${tableClasses.subtaskRow}`}
    >
      <span />
      <div className={tableClasses.caseCell}>
        <span
          className={tableClasses.cellText}
          style={{ fontFamily: "monospace" }}
        >
          S-{index + 1}
        </span>
        <span className={tableClasses.categoryPill}>{subtask.category}</span>
      </div>
      <span
        className={tableClasses.titleText}
        style={{ fontWeight: 400, fontSize: "var(--mantine-font-size-xs)" }}
      >
        {subtask.title}
      </span>
      <span className={tableClasses.cellText}>{parentAssignees}</span>
      <TrackingCell
        pct={tracking.pct}
        barColor={tracking.barColor}
        label={tracking.label}
      />
      <DeadlineCell deadline={deadline} fallback={subtask.dueDate} />
    </Box>
  );
}

export function TaskListRow({ task, displayStatus }: TaskListRowProps) {
  const [expanded, setExpanded] = useState(false);
  const hasSubtasks = (task.subtasks?.length ?? 0) > 0;

  const tracking = getStatusTracking(task, displayStatus);
  const deadline = getDeadline(task);
  const names = assigneeNames(task);
  const actionLabel = getStatusActionLabel(task, displayStatus, tracking.left);
  const categoryLabel = CATEGORY_SHORT[task.category];

  const handleRowClick = () => {
    if (hasSubtasks) setExpanded((v) => !v);
  };

  return (
    <>
      <Box
        className={`${tableClasses.grid} ${tableClasses.row} ${!hasSubtasks ? tableClasses.rowNoExpand : ""}`}
        onClick={handleRowClick}
      >
        <span className={tableClasses.expandIcon}>
          {hasSubtasks &&
            (expanded ? (
              <CaretDownIcon size={12} aria-label="Collapse" />
            ) : (
              <CaretRightIcon size={12} aria-label="Expand" />
            ))}
        </span>

        <div className={tableClasses.caseCell}>
          <span
            className={tableClasses.cellText}
            style={{ fontFamily: "monospace" }}
          >
            {task.taskNumber}
          </span>
          <span
            className={tableClasses.categoryPill}
            title={CATEGORY_LABELS[task.category]}
          >
            {categoryLabel}
          </span>
        </div>

        <span className={tableClasses.titleText}>{task.title}</span>
        <span className={tableClasses.cellText}>{names}</span>

        <TrackingCell
          pct={tracking.pct}
          barColor={tracking.barColor}
          striped={tracking.striped}
          label={actionLabel}
          total={tracking.total}
          active={displayStatus === "in_progress" || displayStatus === "new"}
        />

        <DeadlineCell deadline={deadline} />
      </Box>

      {expanded && hasSubtasks && (
        <Box className={tableClasses.subtaskBlock}>
          {task.subtasks!.map((subtask, i) => (
            <SubtaskRow
              key={subtask.id}
              subtask={subtask}
              index={i}
              parentAssignees={names}
              parentStart={task.startDate}
            />
          ))}
        </Box>
      )}
    </>
  );
}
