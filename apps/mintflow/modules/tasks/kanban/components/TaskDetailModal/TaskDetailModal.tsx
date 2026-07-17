"use client";

import { useState } from "react";
import { Button, Divider, Group, Modal, Stack, Text } from "@peppermint/ui";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { CalendarBlankIcon } from "@phosphor-icons/react/dist/csr/CalendarBlank";
import { SparkleIcon } from "@phosphor-icons/react/dist/csr/Sparkle";
import { TagIcon } from "@phosphor-icons/react/dist/csr/Tag";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { STATUS_COLORS, STATUS_LABELS } from "../../module.api";
import type { Task } from "../../module.api";
import { useDeleteTask } from "../../KanbanDashboard.hooks";
import {
  TaskAssigneePills,
  TaskAttachmentsSection,
  TaskDescriptionBlock,
  TaskListSection,
  TaskModalBody,
  TaskModalFieldRow,
  TaskModalHeader,
  TaskStatusBadge,
  TaskTagBadges,
} from "../TaskModalShared";
import { TASK_MODAL } from "../TaskModalShared";
import type { TaskDetailModalProps } from "./TaskDetailModal.types";

function TaskDetailContent({
  task,
  onClose,
  onEdit,
}: {
  task: NonNullable<TaskDetailModalProps["task"]>;
  onClose: () => void;
  onEdit?: (task: Task) => void;
}) {
  const statusColor = STATUS_COLORS[task.status];
  const statusLabel = STATUS_LABELS[task.status];

  const del = useDeleteTask();
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    await del.mutateAsync(task.id);
    onClose();
  }

  return (
    <Stack gap={0}>
      <TaskModalHeader
        parentLabel={task.group}
        currentLabel={task.title}
        onClose={onClose}
        onEdit={onEdit ? () => onEdit(task) : undefined}
      />

      <TaskModalBody>
        <Text fw={700} fz={24} lh={1.3}>
          {task.title}
        </Text>

        <Stack gap={TASK_MODAL.fieldGap}>
          <TaskModalFieldRow icon={<SparkleIcon size={14} />} label="Status">
            <TaskStatusBadge label={statusLabel} color={statusColor} />
          </TaskModalFieldRow>

          <TaskModalFieldRow icon={<UserIcon size={14} />} label="Assignee">
            <TaskAssigneePills
              assignees={task.assignees}
              fallback={task.assignee}
            />
          </TaskModalFieldRow>

          {(task.startDate || task.endDate) && (
            <TaskModalFieldRow
              icon={<CalendarBlankIcon size={14} />}
              label="Date"
            >
              <Group gap={8} wrap="nowrap">
                <Text size="xs">{task.startDate}</Text>
                <ArrowRightIcon
                  size={12}
                  color="var(--mantine-color-gray-5)"
                  aria-label="to"
                />
                <Text size="xs">{task.endDate}</Text>
              </Group>
            </TaskModalFieldRow>
          )}

          {task.tags?.length ? (
            <TaskModalFieldRow icon={<TagIcon size={14} />} label="Tags">
              <TaskTagBadges tags={task.tags} />
            </TaskModalFieldRow>
          ) : null}
        </Stack>

        {task.description && (
          <TaskDescriptionBlock value={task.description} readOnly />
        )}

        {task.attachments?.length ? (
          <TaskAttachmentsSection attachments={task.attachments} />
        ) : null}

        {task.subtasks?.length ? (
          <TaskListSection subtasks={task.subtasks} />
        ) : null}

        <Divider mt={TASK_MODAL.majorSectionGap} />
        <Group justify="flex-start">
          {confirming ? (
            <Group gap="xs">
              <Text size="xs" c="red.7">
                Delete this task permanently?
              </Text>
              <Button
                size="xs"
                color="red"
                loading={del.isPending}
                onClick={handleDelete}
              >
                Delete
              </Button>
              <Button
                size="xs"
                variant="default"
                onClick={() => setConfirming(false)}
              >
                Cancel
              </Button>
            </Group>
          ) : (
            <Button
              size="xs"
              variant="light"
              color="red"
              leftSection={<TrashIcon size={14} />}
              onClick={() => setConfirming(true)}
            >
              Delete task
            </Button>
          )}
        </Group>
      </TaskModalBody>
    </Stack>
  );
}

export function TaskDetailModal({
  task,
  onClose,
  onEdit,
}: TaskDetailModalProps) {
  return (
    <Modal
      opened={!!task}
      onClose={onClose}
      size={720}
      padding={0}
      withCloseButton={false}
      radius="md"
    >
      {task && (
        <TaskDetailContent
          key={task.id}
          task={task}
          onClose={onClose}
          onEdit={onEdit}
        />
      )}
    </Modal>
  );
}
