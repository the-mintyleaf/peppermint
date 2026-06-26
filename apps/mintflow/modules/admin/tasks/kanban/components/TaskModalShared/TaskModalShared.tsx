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
  Stack,
  Table,
  Text,
  Textarea,
} from "@peppermint/ui";
import { FileTextIcon } from "@phosphor-icons/react/dist/csr/FileText";
import { DownloadSimpleIcon } from "@phosphor-icons/react/dist/csr/DownloadSimple";
import { ExportIcon } from "@phosphor-icons/react/dist/csr/Export";
import { ArrowsOutSimpleIcon } from "@phosphor-icons/react/dist/csr/ArrowsOutSimple";
import { LightbulbIcon } from "@phosphor-icons/react/dist/csr/Lightbulb";
import { ListChecksIcon } from "@phosphor-icons/react/dist/csr/ListChecks";
import { MonitorIcon } from "@phosphor-icons/react/dist/csr/Monitor";
import { PaperclipIcon } from "@phosphor-icons/react/dist/csr/Paperclip";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { SUBTASK_STATUS_COLORS, SUBTASK_STATUS_LABELS } from "../../module.api";
import type {
  Task,
  TaskAttachment,
  TaskSubtask,
  TaskTag,
} from "../../module.api";
import {
  TASK_MODAL,
  addAttachmentStyle,
  assigneePillStyle,
  attachmentCardStyle,
  descriptionInputStyles,
  headerActionStyle,
  tableStyles,
} from "./taskModal.styles";

const FILE_TYPE_COLORS: Record<TaskAttachment["fileType"], string> = {
  pdf: "#e03131",
  fig: "#7048e8",
  img: "#1971c2",
  other: "#868e96",
};

const TAG_ICONS: Record<string, ReactNode> = {
  Design: <LightbulbIcon size={12} aria-label="Design" />,
  "Client Work": <MonitorIcon size={12} aria-label="Client Work" />,
  Review: <LightbulbIcon size={12} aria-label="Review" />,
  Internal: <MonitorIcon size={12} aria-label="Internal" />,
};

export function TaskModalHeader({
  parentLabel,
  currentLabel,
  onClose,
  onEdit,
  showActions = true,
}: {
  parentLabel: string;
  currentLabel: string;
  onClose: () => void;
  onEdit?: () => void;
  showActions?: boolean;
}) {
  return (
    <>
      <Group
        justify="space-between"
        px={TASK_MODAL.headerPaddingX}
        py={TASK_MODAL.headerPaddingY}
      >
        <Group gap={8} wrap="nowrap">
          <ActionIcon
            variant="default"
            size="md"
            aria-label="Expand"
            style={headerActionStyle}
          >
            <ArrowsOutSimpleIcon size={14} />
          </ActionIcon>
          <Text size="xs" c="dimmed">
            {parentLabel}
            <Text span c="dimmed" mx={6}>
              /
            </Text>
            <Text span c="dark">
              {currentLabel}
            </Text>
          </Text>
        </Group>
        {showActions && (
          <Group gap={6}>
            <ActionIcon
              variant="default"
              size="md"
              aria-label="Share"
              style={headerActionStyle}
            >
              <ExportIcon size={14} />
            </ActionIcon>
            <ActionIcon
              variant="default"
              size="md"
              aria-label="Edit"
              onClick={onEdit}
              style={headerActionStyle}
            >
              <PencilSimpleIcon size={14} />
            </ActionIcon>
            <ActionIcon
              variant="default"
              size="md"
              aria-label="Close"
              onClick={onClose}
              style={headerActionStyle}
            >
              <XIcon size={14} />
            </ActionIcon>
          </Group>
        )}
      </Group>
      <Divider />
    </>
  );
}

export function TaskModalFieldRow({
  icon,
  label,
  children,
  align = "center",
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
  align?: "center" | "flex-start";
}) {
  return (
    <Group gap={8} align={align} wrap="nowrap">
      <Box
        w={16}
        mt={align === "flex-start" ? 2 : 0}
        style={{ color: "var(--mantine-color-gray-5)", flexShrink: 0 }}
      >
        {icon}
      </Box>
      <Text
        size="xs"
        c="dimmed"
        w={TASK_MODAL.fieldLabelWidth}
        style={{ flexShrink: 0 }}
      >
        {label}
      </Text>
      <Box style={{ flex: 1, minWidth: 0 }}>{children}</Box>
    </Group>
  );
}

export function TaskStatusBadge({
  label,
  color,
}: {
  label: string;
  color: string;
}) {
  return (
    <Badge
      color={color}
      variant="light"
      size="sm"
      radius="xl"
      leftSection={
        <Box
          w={6}
          h={6}
          style={{
            borderRadius: "50%",
            background: `var(--mantine-color-${color}-6)`,
          }}
        />
      }
    >
      {label}
    </Badge>
  );
}

export function TaskAssigneePills({
  assignees,
  fallback,
}: {
  assignees?: Task["assignees"];
  fallback?: string;
}) {
  if (assignees?.length) {
    return (
      <Group gap={8}>
        {assignees.map((a) => (
          <Group key={a.name} gap={8} style={assigneePillStyle} wrap="nowrap">
            <Avatar size={22} color={a.color} radius="xl">
              <Text size="10px" fw={700}>
                {a.initials}
              </Text>
            </Avatar>
            <Text size="xs">{a.name}</Text>
          </Group>
        ))}
      </Group>
    );
  }

  return (
    <Text size="xs" c="dimmed">
      {fallback ?? "Unassigned"}
    </Text>
  );
}

export function TaskTagBadges({ tags }: { tags: TaskTag[] }) {
  return (
    <Group gap={8}>
      {tags.map((tag) => (
        <Badge
          key={tag.label}
          color={tag.color}
          variant="light"
          size="sm"
          radius="xl"
          leftSection={TAG_ICONS[tag.label]}
        >
          {tag.label}
        </Badge>
      ))}
    </Group>
  );
}

export function TaskDescriptionBlock({
  value,
  readOnly = true,
  onChange,
}: {
  value: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
}) {
  return (
    <Box mt={TASK_MODAL.majorSectionGap}>
      <Group gap={8} mb={6} align="center">
        <FileTextIcon size={14} color="var(--mantine-color-gray-6)" />
        <Text size="xs" fw={600}>
          Description
        </Text>
      </Group>
      <Textarea
        value={value}
        readOnly={readOnly}
        onChange={onChange ? (e) => onChange(e.currentTarget.value) : undefined}
        placeholder={readOnly ? undefined : "Add a description…"}
        autosize
        minRows={3}
        styles={descriptionInputStyles}
      />
    </Box>
  );
}

function AttachmentChip({ attachment }: { attachment: TaskAttachment }) {
  const bgColor = FILE_TYPE_COLORS[attachment.fileType];
  const ext = attachment.fileType.toUpperCase();

  return (
    <Group gap={8} style={attachmentCardStyle} wrap="nowrap">
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
        <Text size="xs" c="white" fw={700}>
          {ext}
        </Text>
      </Box>
      <Box>
        <Text size="xs" fw={500} lineClamp={1}>
          {attachment.name}
        </Text>
        <Text size="xs" c="dimmed">
          {attachment.size}
        </Text>
      </Box>
    </Group>
  );
}

export function TaskAttachmentsSection({
  attachments,
  showAdd = true,
}: {
  attachments: TaskAttachment[];
  showAdd?: boolean;
}) {
  if (!attachments.length && !showAdd) return null;

  return (
    <Box mt={TASK_MODAL.majorSectionGap}>
      <Group justify="space-between" mb={6}>
        <Group gap={8}>
          <PaperclipIcon size={14} color="var(--mantine-color-gray-6)" />
          <Text size="xs" fw={600}>
            Attachment
          </Text>
          {attachments.length > 0 && (
            <Badge size="xs" variant="filled" color="dark" circle>
              {attachments.length}
            </Badge>
          )}
        </Group>
        {attachments.length > 0 && (
          <Anchor
            size="xs"
            c="violet.6"
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            <DownloadSimpleIcon size={12} aria-label="Download all" />
            Download All
          </Anchor>
        )}
      </Group>
      <Group gap={8} align="stretch">
        {attachments.map((a) => (
          <AttachmentChip key={a.name} attachment={a} />
        ))}
        {showAdd && (
          <Box style={addAttachmentStyle} aria-label="Add attachment">
            <Text size="lg" c="dimmed" lh={1}>
              +
            </Text>
          </Box>
        )}
      </Group>
    </Box>
  );
}

export function TaskListSection({ subtasks }: { subtasks: TaskSubtask[] }) {
  if (!subtasks.length) return null;

  return (
    <Box mt={TASK_MODAL.majorSectionGap}>
      <Group gap={8} mb={6}>
        <ListChecksIcon size={14} color="var(--mantine-color-gray-6)" />
        <Text size="xs" fw={600}>
          Task List
        </Text>
      </Group>
      <Table
        withTableBorder
        withColumnBorders
        highlightOnHover
        styles={tableStyles}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th w={48}>No</Table.Th>
            <Table.Th>Task</Table.Th>
            <Table.Th w={110}>Category</Table.Th>
            <Table.Th w={120}>Status</Table.Th>
            <Table.Th w={120}>Due Date</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {subtasks.map((subtask, index) => (
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
  );
}

export function TaskModalBody({ children }: { children: ReactNode }) {
  return (
    <Box
      px={TASK_MODAL.contentPadding}
      py={TASK_MODAL.contentPadding}
      style={{ overflowY: "auto", maxHeight: "calc(90vh - 60px)" }}
    >
      <Stack gap={TASK_MODAL.sectionGap}>{children}</Stack>
    </Box>
  );
}
