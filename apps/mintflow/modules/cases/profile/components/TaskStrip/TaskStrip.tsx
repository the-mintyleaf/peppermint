"use client";

import {
  ActionIcon,
  Box,
  Group,
  Menu,
  ScrollArea,
  UnstyledButton,
} from "@peppermint/ui";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { DotsThreeIcon } from "@phosphor-icons/react/dist/csr/DotsThree";

import { MonoText } from "@/components";
import { tokens } from "@/config/design";
import {
  availableTaskActions,
  TASK_ACTION_LABEL,
  TASK_STATE_STYLE,
  type TaskActionKind,
  type TaskChipView,
} from "../../caseView";
import type { TaskStripProps } from "./TaskStrip.types";

// Commands the quick menu offers; `return` (needs reason+report) is a form → later.
const QUICK_ACTIONS: ReadonlySet<TaskActionKind> = new Set([
  "start",
  "complete",
  "archive",
]);

function TaskChip({
  task,
  active,
  onToggle,
  onAction,
  pending,
}: {
  task: TaskChipView;
  active: boolean;
  onToggle: (id: string) => void;
  onAction?: (action: TaskActionKind, task: TaskChipView) => void;
  pending: boolean;
}) {
  const state = TASK_STATE_STYLE[task.state];
  const done = task.state === "done";
  const actions = onAction
    ? availableTaskActions(task.status).filter((a) => QUICK_ACTIONS.has(a))
    : [];

  return (
    <Group
      gap={2}
      wrap="nowrap"
      style={{
        flexShrink: 0,
        borderRadius: 12,
        background: active ? tokens.tile : tokens.paper,
        border: `1px solid ${active ? tokens.tile : tokens.line}`,
        boxShadow: active ? tokens.shadow.card : undefined,
      }}
    >
      <UnstyledButton
        onClick={() => onToggle(task.id)}
        aria-pressed={active}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          padding: "8px 4px 8px 12px",
        }}
      >
        {done ? (
          <Box
            w={14}
            h={14}
            style={{
              borderRadius: "50%",
              background: state.color,
              color: tokens.paper,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "0 0 auto",
            }}
          >
            <CheckIcon size={9} weight="bold" />
          </Box>
        ) : (
          <Box
            w={7}
            h={7}
            style={{
              borderRadius: "50%",
              background: state.color,
              flex: "0 0 auto",
            }}
          />
        )}
        <Box
          component="span"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: active ? tokens.paper : tokens.ink,
            whiteSpace: "nowrap",
            maxWidth: 220,
            overflow: "hidden",
            textOverflow: "ellipsis",
            textDecoration: done ? "line-through" : undefined,
            opacity: done && !active ? 0.7 : 1,
          }}
        >
          {task.title}
        </Box>
      </UnstyledButton>

      {onAction && actions.length > 0 ? (
        <Menu shadow="sm" width={180} position="bottom-end" withinPortal>
          <Menu.Target>
            <ActionIcon
              variant="subtle"
              color={active ? "gray.0" : "gray"}
              size="sm"
              mr={4}
              loading={pending}
              aria-label={`${task.title} actions`}
              onClick={(e) => e.stopPropagation()}
            >
              <DotsThreeIcon size={16} weight="bold" />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
            {actions.map((action) => (
              <Menu.Item
                key={action}
                color={action === "archive" ? "red" : undefined}
                onClick={() => onAction(action, task)}
              >
                {TASK_ACTION_LABEL[action]}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      ) : null}
    </Group>
  );
}

/**
 * The one question this answers: "what are the steps on this case and where are
 * we?" Each chip is a task (state-colored dot, done = check); selecting one
 * filters the activity feed, and its menu runs form-free lifecycle commands.
 */
export function TaskStrip({
  tasks,
  selectedId,
  onToggle,
  onAction,
  pendingTaskId,
}: TaskStripProps) {
  return (
    <Group gap={9} wrap="nowrap" align="center">
      <MonoText
        label
        fz="11px"
        fw={700}
        c={tokens.muted}
        style={{ flexShrink: 0 }}
      >
        Tasks · {tasks.length}
      </MonoText>

      <ScrollArea
        scrollbarSize={6}
        type="hover"
        style={{ flex: 1, minWidth: 0 }}
      >
        <Group gap={8} wrap="nowrap" py={4}>
          {tasks.map((task) => (
            <TaskChip
              key={task.id}
              task={task}
              active={task.id === selectedId}
              onToggle={onToggle}
              onAction={onAction}
              pending={pendingTaskId === task.id}
            />
          ))}
        </Group>
      </ScrollArea>
    </Group>
  );
}
