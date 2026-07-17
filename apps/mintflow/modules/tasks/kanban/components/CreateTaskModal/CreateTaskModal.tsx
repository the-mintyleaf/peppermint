"use client";

import {
  Button,
  DatePickerInput,
  Group,
  Modal,
  MultiSelect,
  Select,
  Stack,
  TextInput,
} from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import { z } from "zod";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { CalendarBlankIcon } from "@phosphor-icons/react/dist/csr/CalendarBlank";
import { SparkleIcon } from "@phosphor-icons/react/dist/csr/Sparkle";
import { TagIcon } from "@phosphor-icons/react/dist/csr/Tag";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";

import { STATUS_LABELS, TEAM_MEMBERS } from "../../module.api";
import type { Task, TaskInput, TaskStatus, TaskTag } from "../../module.api";
import { useCreateTask, useUpdateTask } from "../../KanbanDashboard.hooks";
import {
  TaskAttachmentsSection,
  TaskDescriptionBlock,
  TaskListSection,
  TaskModalBody,
  TaskModalFieldRow,
  TaskModalHeader,
  TASK_MODAL,
} from "../TaskModalShared";
import type {
  CreateTaskFormValues,
  CreateTaskModalProps,
  TaskFormBodyProps,
} from "./CreateTaskModal.types";

const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const ASSIGNEE_OPTIONS = TEAM_MEMBERS.map((m) => ({
  value: m.name,
  label: m.name,
}));

const COMMON_TAGS = [
  "Design",
  "Client Work",
  "Review",
  "Internal",
  "Finance",
  "Legal",
  "Marketing",
  "HR",
  "Compliance",
  "Urgent",
];

const TAG_COLOR: Record<string, string> = {
  Design: "pink",
  "Client Work": "teal",
  Review: "violet",
  Internal: "gray",
  Finance: "yellow",
  Legal: "grape",
  Marketing: "orange",
  HR: "cyan",
  Compliance: "red",
  Urgent: "red",
};

const schema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  status: z.string(),
  assignees: z.array(z.string()),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  tags: z.array(z.string()),
  description: z.string(),
});

function buildInitial(
  editTask: Task | null | undefined,
  initialStatus: TaskStatus | undefined,
): CreateTaskFormValues {
  if (editTask) {
    return {
      title: editTask.title,
      status: editTask.status,
      assignees:
        editTask.assignees?.map((a) => a.name) ??
        (editTask.assignee ? [editTask.assignee] : []),
      startDate: editTask.startDate ?? null,
      endDate: editTask.endDate ?? null,
      tags: editTask.tags?.map((t) => t.label) ?? [],
      description: editTask.description ?? "",
    };
  }
  return {
    title: "",
    status: initialStatus ?? "ongoing",
    assignees: [],
    startDate: null,
    endDate: null,
    tags: [],
    description: "",
  };
}

function toTaskInput(
  values: CreateTaskFormValues,
  colorFor: (label: string) => string,
): TaskInput {
  const tags: TaskTag[] = values.tags.map((label) => ({
    label,
    color: colorFor(label),
  }));
  return {
    title: values.title,
    status: values.status as TaskStatus,
    assigneeNames: values.assignees,
    startDate: values.startDate,
    endDate: values.endDate,
    tags,
    description: values.description,
  };
}

export function CreateTaskModal({
  opened,
  onClose,
  editTask,
  initialStatus,
}: CreateTaskModalProps) {
  const isEdit = !!editTask;
  const create = useCreateTask();
  const update = useUpdateTask();

  // Remount FormWrapper (fresh `initial`) whenever the target record changes.
  const formKey = editTask
    ? `edit-${editTask.id}`
    : `new-${initialStatus ?? "any"}`;

  const tagOptions = [
    ...new Set([
      ...COMMON_TAGS,
      ...(editTask?.tags?.map((t) => t.label) ?? []),
    ]),
  ];

  // Keep a tag's existing colour on edit; fall back to the palette, then gray.
  const existingTagColors = new Map(
    editTask?.tags?.map((t) => [t.label, t.color]) ?? [],
  );
  const colorFor = (label: string) =>
    existingTagColors.get(label) ?? TAG_COLOR[label] ?? "gray";

  async function submit(values: CreateTaskFormValues) {
    const input = toTaskInput(values, colorFor);
    try {
      if (editTask) await update.mutateAsync({ id: editTask.id, input });
      else await create.mutateAsync(input);
      onClose();
      return { ok: true };
    } catch (e) {
      return {
        ok: false,
        message: e instanceof Error ? e.message : "Could not save task",
      };
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size={720}
      padding={0}
      withCloseButton={false}
      radius="md"
    >
      <FormWrapper<CreateTaskFormValues>
        key={formKey}
        initial={buildInitial(editTask, initialStatus)}
        validation={[schema]}
        finalSubmitFn={submit}
      >
        <Stack gap={0}>
          <TaskModalHeader
            parentLabel="Tasks"
            currentLabel={
              isEdit ? (editTask?.title ?? "Edit Task") : "New Task"
            }
            onClose={onClose}
            showActions={false}
          />
          <TaskFormBody
            isEdit={isEdit}
            editTask={editTask ?? null}
            tagOptions={tagOptions}
            onCancel={onClose}
          />
        </Stack>
      </FormWrapper>
    </Modal>
  );
}

function TaskFormBody({
  isEdit,
  editTask,
  tagOptions,
  onCancel,
}: TaskFormBodyProps) {
  const { form } = useFormInstance<CreateTaskFormValues>();
  const { handleSubmit, isLoading } = useFormControls();

  return (
    <TaskModalBody>
      <TextInput
        placeholder="Task title"
        variant="unstyled"
        styles={{
          input: {
            fontSize: 24,
            fontWeight: 700,
            padding: 0,
            lineHeight: 1.3,
            height: "auto",
          },
        }}
        {...form.getInputProps("title")}
      />

      <Stack gap={TASK_MODAL.fieldGap}>
        <TaskModalFieldRow icon={<SparkleIcon size={14} />} label="Status">
          <Select
            size="xs"
            data={STATUS_OPTIONS}
            allowDeselect={false}
            styles={{
              input: {
                maxWidth: 180,
                fontSize: "var(--mantine-font-size-xs)",
              },
            }}
            {...form.getInputProps("status")}
          />
        </TaskModalFieldRow>

        <TaskModalFieldRow icon={<UserIcon size={14} />} label="Assignee">
          <MultiSelect
            size="xs"
            placeholder="Add assignee"
            data={ASSIGNEE_OPTIONS}
            styles={{ input: { fontSize: "var(--mantine-font-size-xs)" } }}
            {...form.getInputProps("assignees")}
          />
        </TaskModalFieldRow>

        <TaskModalFieldRow icon={<CalendarBlankIcon size={14} />} label="Date">
          <Group gap={8} wrap="nowrap" align="center">
            <DatePickerInput
              size="xs"
              placeholder="Start date"
              clearable
              style={{ flex: 1 }}
              styles={{ input: { fontSize: "var(--mantine-font-size-xs)" } }}
              {...form.getInputProps("startDate")}
            />
            <ArrowRightIcon
              size={12}
              color="var(--mantine-color-gray-5)"
              aria-label="to"
            />
            <DatePickerInput
              size="xs"
              placeholder="Due date"
              clearable
              style={{ flex: 1 }}
              styles={{ input: { fontSize: "var(--mantine-font-size-xs)" } }}
              {...form.getInputProps("endDate")}
            />
          </Group>
        </TaskModalFieldRow>

        <TaskModalFieldRow icon={<TagIcon size={14} />} label="Tags">
          <MultiSelect
            size="xs"
            placeholder="Add tags"
            data={tagOptions}
            searchable
            styles={{ input: { fontSize: "var(--mantine-font-size-xs)" } }}
            {...form.getInputProps("tags")}
          />
        </TaskModalFieldRow>
      </Stack>

      <TaskDescriptionBlock
        value={form.values.description}
        readOnly={false}
        onChange={(value) => form.setFieldValue("description", value)}
      />

      {isEdit && editTask?.attachments?.length ? (
        <TaskAttachmentsSection
          attachments={editTask.attachments}
          showAdd={false}
        />
      ) : null}

      {isEdit && editTask?.subtasks?.length ? (
        <TaskListSection subtasks={editTask.subtasks} />
      ) : null}

      <Group justify="flex-end" gap="sm">
        <Button variant="default" size="xs" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          size="xs"
          color="dark"
          loading={isLoading}
          onClick={handleSubmit}
        >
          {isEdit ? "Save Changes" : "Create Task"}
        </Button>
      </Group>
    </TaskModalBody>
  );
}
