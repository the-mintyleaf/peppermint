"use client";

import { useEffect } from "react";
import {
  Button,
  Group,
  Modal,
  MultiSelect,
  Select,
  Stack,
  TextInput,
  useForm,
} from "@peppermint/ui";
import { DatePickerInput } from "@peppermint/ui";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { CalendarBlankIcon } from "@phosphor-icons/react/dist/csr/CalendarBlank";
import { SparkleIcon } from "@phosphor-icons/react/dist/csr/Sparkle";
import { TagIcon } from "@phosphor-icons/react/dist/csr/Tag";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { STATUS_LABELS } from "../../module.api";
import {
  TaskAttachmentsSection,
  TaskDescriptionBlock,
  TaskListSection,
  TaskModalBody,
  TaskModalFieldRow,
  TaskModalHeader,
  TASK_MODAL,
} from "../TaskModalShared";
import type { CreateTaskModalProps, CreateTaskFormValues } from "./CreateTaskModal.types";

const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }));

const ASSIGNEE_OPTIONS = [
  { value: "achmad_hakim", label: "Achmad Hakim" },
  { value: "samantha_emanuel", label: "Samantha Emanuel" },
  { value: "sudhan_grg", label: "Sudhan Grg." },
  { value: "anamol_m", label: "Anamol M." },
];

const TAG_OPTIONS = [
  { value: "design", label: "Design" },
  { value: "client_work", label: "Client Work" },
  { value: "review", label: "Review" },
  { value: "internal", label: "Internal" },
];

const PLACEHOLDER_ATTACHMENTS = [
  { name: "Brief_v1.pdf", size: "4.8 Mb", fileType: "pdf" as const },
  { name: "Workflow.fig", size: "12.4 Mb", fileType: "fig" as const },
];

const PLACEHOLDER_SUBTASKS = [
  { id: "new-1", title: "Schedule kickoff meeting", category: "Discovery", status: "completed" as const, dueDate: "June 3, 2025" },
  { id: "new-2", title: "Gather requirements", category: "Discovery", status: "completed" as const, dueDate: "June 4, 2025" },
  { id: "new-3", title: "Create wireframes", category: "Discovery", status: "in_progress" as const, dueDate: "June 5, 2025" },
];

export function CreateTaskModal({ opened, onClose, onSubmit, editTask, initialStatus }: CreateTaskModalProps) {
  const isEdit = !!editTask;

  const form = useForm<CreateTaskFormValues>({
    initialValues: {
      title: "",
      status: "ongoing",
      assignees: [],
      startDate: null,
      endDate: null,
      tags: [],
      description: "",
    },
    validate: {
      title: (v) => (v.trim().length === 0 ? "Title is required" : null),
    },
  });

  useEffect(() => {
    if (!opened) return;

    if (editTask) {
      form.setValues({
        title: editTask.title,
        status: editTask.status,
        assignees: editTask.assignees?.map((a) => a.name) ?? [],
        startDate: null,
        endDate: null,
        tags: editTask.tags?.map((t) => t.label.toLowerCase().replace(" ", "_")) ?? [],
        description: editTask.description ?? "",
      });
      return;
    }

    form.setValues({
      title: "",
      status: initialStatus ?? "ongoing",
      assignees: [],
      startDate: null,
      endDate: null,
      tags: [],
      description: "",
    });
  }, [opened, editTask, initialStatus]);

  function handleSubmit(values: CreateTaskFormValues) {
    onSubmit?.(values);
    form.reset();
    onClose();
  }

  function handleClose() {
    form.reset();
    onClose();
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      size={720}
      padding={0}
      withCloseButton={false}
      radius="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap={0}>
          <TaskModalHeader
            parentLabel="Client Projects"
            currentLabel={isEdit ? (editTask?.title ?? "Edit Task") : "New Task"}
            onClose={handleClose}
          />

          <TaskModalBody>
            <TextInput
              placeholder="New Task"
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
                  styles={{
                    input: { fontSize: "var(--mantine-font-size-xs)" },
                  }}
                  {...form.getInputProps("assignees")}
                />
              </TaskModalFieldRow>

              <TaskModalFieldRow icon={<CalendarBlankIcon size={14} />} label="Date">
                <Group gap={8} wrap="nowrap" align="center">
                  <DatePickerInput
                    size="xs"
                    placeholder="June 3, 2025"
                    style={{ flex: 1 }}
                    styles={{ input: { fontSize: "var(--mantine-font-size-xs)" } }}
                    {...form.getInputProps("startDate")}
                  />
                  <ArrowRightIcon size={12} color="var(--mantine-color-gray-5)" aria-label="to" />
                  <DatePickerInput
                    size="xs"
                    placeholder="June 28, 2025"
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
                  data={TAG_OPTIONS}
                  styles={{
                    input: { fontSize: "var(--mantine-font-size-xs)" },
                  }}
                  {...form.getInputProps("tags")}
                />
              </TaskModalFieldRow>
            </Stack>

            <TaskDescriptionBlock
              value={form.values.description}
              readOnly={false}
              onChange={(value) => form.setFieldValue("description", value)}
            />

            <TaskAttachmentsSection attachments={PLACEHOLDER_ATTACHMENTS} />

            <TaskListSection subtasks={PLACEHOLDER_SUBTASKS} />

            <Group justify="flex-end" gap="sm">
              <Button variant="default" size="xs" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" size="xs" color="dark">
                {isEdit ? "Save Changes" : "Create Task"}
              </Button>
            </Group>
          </TaskModalBody>
        </Stack>
      </form>
    </Modal>
  );
}
