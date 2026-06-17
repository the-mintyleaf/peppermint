"use client";

import { ReactNode } from "react";
import {
  ActionIcon,
  Anchor,
  Avatar,
  Badge,
  Box,
  Divider,
  Group,
  Modal,
  Stack,
  Table,
  Text,
  Textarea,
} from "@peppermint/ui";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { ArrowsOutSimpleIcon } from "@phosphor-icons/react/dist/csr/ArrowsOutSimple";
import { CalendarBlankIcon } from "@phosphor-icons/react/dist/csr/CalendarBlank";
import { FileTextIcon } from "@phosphor-icons/react/dist/csr/FileText";
import { ListChecksIcon } from "@phosphor-icons/react/dist/csr/ListChecks";
import { PaperclipIcon } from "@phosphor-icons/react/dist/csr/Paperclip";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { SparkleIcon } from "@phosphor-icons/react/dist/csr/Sparkle";
import { TagIcon } from "@phosphor-icons/react/dist/csr/Tag";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import {
  CATEGORY_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  SUBTASK_STATUS_COLORS,
  SUBTASK_STATUS_LABELS,
} from "../../module.api";
import type { Task, TaskAttachment } from "../../module.api";
import type { TaskDetailModalProps } from "./TaskDetailModal.types";

const FILE_TYPE_COLORS: Record<TaskAttachment["fileType"], string> = {
  pdf: "#e03131",
  fig: "#7048e8",
  img: "#1971c2",
  other: "#868e96",
};

function FieldRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <Group gap="xs" align="center" wrap="nowrap">
      <Box w={16} style={{ color: "var(--mantine-color-gray-5)", flexShrink: 0 }}>
        {icon}
      </Box>
      <Text size="xs" c="dimmed" w={80} style={{ flexShrink: 0 }}>
        {label}
      </Text>
      <Box style={{ flex: 1 }}>{children}</Box>
    </Group>
  );
}

function AttachmentChip({ attachment }: { attachment: TaskAttachment }) {
  const bgColor = FILE_TYPE_COLORS[attachment.fileType];
  const ext = attachment.fileType.toUpperCase();

  return (
    <Group
      gap={8}
      px={10}
      py={6}
      style={{
        border: "1px solid var(--mantine-color-gray-2)",
        borderRadius: "var(--mantine-radius-sm)",
        background: "white",
        minWidth: 160,
      }}
    >
      <Box
        w={32}
        h={32}
        style={{
          borderRadius: "var(--mantine-radius-xs)",
          backgroundColor: bgColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Text size="xs" c="white" fw={700}>{ext}</Text>
      </Box>
      <Box>
        <Text size="xs" fw={500} lineClamp={1}>{attachment.name}</Text>
        <Text size="xs" c="dimmed">{attachment.size}</Text>
      </Box>
    </Group>
  );
}

function TaskDetailContent({ task, onClose }: { task: Task; onClose: () => void }) {
  const statusColor = STATUS_COLORS[task.status];
  const statusLabel = STATUS_LABELS[task.status];

  return (
    <Stack gap={0}>
      {/* Header */}
      <Group justify="space-between" px="lg" py="sm">
        <Group gap={4}>
          <ActionIcon variant="subtle" size="sm" color="gray" aria-label="Expand">
            <ArrowsOutSimpleIcon size={14} />
          </ActionIcon>
          <Text size="xs" c="dimmed">
            {task.group}
            <Text span c="dimmed" mx={4}>/</Text>
            <Text span c="dark">{task.taskNumber}</Text>
          </Text>
        </Group>
        <Group gap={4}>
          <ActionIcon variant="subtle" size="sm" color="gray" aria-label="Edit">
            <PencilSimpleIcon size={14} />
          </ActionIcon>
          <ActionIcon variant="subtle" size="sm" color="gray" aria-label="Close" onClick={onClose}>
            <XIcon size={14} />
          </ActionIcon>
        </Group>
      </Group>

      <Divider />

      <Box px="lg" py="md" style={{ overflowY: "auto", maxHeight: "calc(90vh - 60px)" }}>
        {/* Title */}
        <Text fw={700} size="lg" mb="md">{task.title}</Text>

        {/* Fields */}
        <Stack gap="sm" mb="lg">
          <FieldRow icon={<SparkleIcon size={14} />} label="Status">
            <Badge color={statusColor} variant="light" size="sm" radius="xl">{statusLabel}</Badge>
          </FieldRow>

          <FieldRow icon={<UserIcon size={14} />} label="Assignee">
            <Group gap={6}>
              {task.assignees?.length ? (
                task.assignees.map((a) => (
                  <Group
                    key={a.name}
                    gap={6}
                    px={8}
                    py={4}
                    style={{
                      border: "1px solid var(--mantine-color-gray-2)",
                      borderRadius: "var(--mantine-radius-xl)",
                      background: "white",
                    }}
                  >
                    <Avatar size={18} color={a.color} radius="xl">
                      <Text size="xs" fw={700}>{a.initials}</Text>
                    </Avatar>
                    <Text size="xs">{a.name}</Text>
                  </Group>
                ))
              ) : (
                <Text size="xs" c="dimmed">{task.assignee}</Text>
              )}
            </Group>
          </FieldRow>

          {(task.startDate || task.endDate) && (
            <FieldRow icon={<CalendarBlankIcon size={14} />} label="Date">
              <Group gap={6}>
                <Text size="xs">{task.startDate}</Text>
                <ArrowRightIcon size={12} color="var(--mantine-color-gray-5)" />
                <Text size="xs">{task.endDate}</Text>
              </Group>
            </FieldRow>
          )}

          {task.tags?.length ? (
            <FieldRow icon={<TagIcon size={14} />} label="Tags">
              <Group gap={6}>
                {task.tags.map((tag) => (
                  <Badge key={tag.label} color={tag.color} variant="light" size="sm" radius="xl">
                    {tag.label}
                  </Badge>
                ))}
              </Group>
            </FieldRow>
          ) : null}
        </Stack>

        {/* Description */}
        {task.description && (
          <Box mb="lg">
            <Group gap={6} mb={8}>
              <FileTextIcon size={14} color="var(--mantine-color-gray-6)" />
              <Text size="xs" fw={600}>Description</Text>
            </Group>
            <Textarea
              value={task.description}
              readOnly
              autosize
              minRows={3}
              styles={{
                input: {
                  fontSize: "var(--mantine-font-size-xs)",
                  backgroundColor: "var(--mantine-color-gray-0)",
                  cursor: "default",
                },
              }}
            />
          </Box>
        )}

        {/* Attachments */}
        {task.attachments?.length ? (
          <Box mb="lg">
            <Group justify="space-between" mb={8}>
              <Group gap={6}>
                <PaperclipIcon size={14} color="var(--mantine-color-gray-6)" />
                <Text size="xs" fw={600}>Attachment</Text>
                <Badge size="xs" variant="filled" color="dark" circle>
                  {task.attachments.length}
                </Badge>
              </Group>
              <Anchor size="xs" c="blue.6">Download All</Anchor>
            </Group>
            <Group gap={8}>
              {task.attachments.map((a) => (
                <AttachmentChip key={a.name} attachment={a} />
              ))}
              <ActionIcon
                variant="default"
                size={44}
                radius="sm"
                aria-label="Add attachment"
                style={{ border: "1px dashed var(--mantine-color-gray-3)" }}
              >
                <Text size="lg" c="dimmed">+</Text>
              </ActionIcon>
            </Group>
          </Box>
        ) : null}

        {/* Subtask table */}
        {task.subtasks?.length ? (
          <Box>
            <Group gap={6} mb={8}>
              <ListChecksIcon size={14} color="var(--mantine-color-gray-6)" />
              <Text size="xs" fw={600}>Task List</Text>
            </Group>
            <Table
              withTableBorder
              withColumnBorders
              highlightOnHover
              styles={{
                th: { fontSize: "var(--mantine-font-size-xs)", fontWeight: 600, color: "var(--mantine-color-gray-6)" },
                td: { fontSize: "var(--mantine-font-size-xs)" },
              }}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th w={40}>No</Table.Th>
                  <Table.Th>Task</Table.Th>
                  <Table.Th w={100}>Category</Table.Th>
                  <Table.Th w={110}>Status</Table.Th>
                  <Table.Th w={110}>Due Date</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {task.subtasks.map((subtask, index) => (
                  <Table.Tr key={subtask.id}>
                    <Table.Td c="dimmed">{index + 1}</Table.Td>
                    <Table.Td>{subtask.title}</Table.Td>
                    <Table.Td c="dimmed">{subtask.category}</Table.Td>
                    <Table.Td>
                      <Badge
                        color={SUBTASK_STATUS_COLORS[subtask.status]}
                        variant={subtask.status === "completed" ? "filled" : "light"}
                        size="sm"
                        radius="xl"
                      >
                        {SUBTASK_STATUS_LABELS[subtask.status]}
                      </Badge>
                    </Table.Td>
                    <Table.Td c="dimmed">{subtask.dueDate}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Box>
        ) : null}
      </Box>
    </Stack>
  );
}

export function TaskDetailModal({ task, onClose }: TaskDetailModalProps) {
  return (
    <Modal
      opened={!!task}
      onClose={onClose}
      size="lg"
      padding={0}
      withCloseButton={false}
      radius="md"
    >
      {task && <TaskDetailContent task={task} onClose={onClose} />}
    </Modal>
  );
}
