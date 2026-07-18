"use client";

import {
  Button,
  DatePickerInput,
  Group,
  Modal,
  Stack,
  Switch,
  Textarea,
  TextInput,
} from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import { z } from "zod";

import { getWorkErrorMessage } from "@/lib/work";
import { useCreateTask } from "../../../cases.mutations";
import type {
  CreateTaskFormValues,
  CreateTaskModalProps,
} from "./CreateTaskModal.types";

const schema = z.object({
  title_np: z.string().trim().min(1, "A Nepali title is required"),
  title_en: z.string(),
  description: z.string(),
  due_at: z.string().nullable(),
  review_required: z.boolean(),
  is_mandatory: z.boolean(),
});

const INITIAL: CreateTaskFormValues = {
  title_np: "",
  title_en: "",
  description: "",
  due_at: null,
  review_required: false,
  is_mandatory: false,
};

/** A date-only picker value → an ISO datetime the backend's DateTimeField accepts. */
function toIsoDateTime(value: string | null): string | undefined {
  if (!value) return undefined;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00Z` : value;
}

export function CreateTaskModal({
  workId,
  responsibleUnit,
  opened,
  onClose,
}: CreateTaskModalProps) {
  const create = useCreateTask(workId);

  async function submit(values: CreateTaskFormValues) {
    try {
      await create.mutateAsync({
        title_np: values.title_np.trim(),
        responsible_unit: responsibleUnit,
        title_en: values.title_en.trim() || undefined,
        description: values.description.trim() || undefined,
        review_required: values.review_required,
        is_mandatory: values.is_mandatory,
        due_at: toIsoDateTime(values.due_at),
      });
      onClose();
      return { ok: true };
    } catch (e) {
      return { ok: false, message: getWorkErrorMessage(e) };
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="New task"
      centered
      radius="md"
      size={520}
      closeOnClickOutside={false}
    >
      {/* key remounts a fresh form each time the modal opens */}
      <FormWrapper<CreateTaskFormValues>
        key={opened ? "open" : "closed"}
        initial={INITIAL}
        validation={[schema]}
        finalSubmitFn={submit}
      >
        <CreateTaskFields onCancel={onClose} />
      </FormWrapper>
    </Modal>
  );
}

function CreateTaskFields({ onCancel }: { onCancel: () => void }) {
  const { form } = useFormInstance<CreateTaskFormValues>();
  const { handleSubmit, isLoading } = useFormControls();

  return (
    <Stack gap="md">
      <TextInput
        label="Title (Nepali)"
        placeholder="कार्यको शीर्षक"
        required
        {...form.getInputProps("title_np")}
      />
      <TextInput
        label="Title (English)"
        placeholder="Task title"
        {...form.getInputProps("title_en")}
      />
      <Textarea
        label="Description"
        placeholder="What needs to be done"
        autosize
        minRows={2}
        maxRows={5}
        {...form.getInputProps("description")}
      />
      <DatePickerInput
        label="Due date"
        placeholder="Pick a date"
        clearable
        {...form.getInputProps("due_at")}
      />
      <Switch
        label="Requires review"
        description="Completion goes through a review round before it's done"
        {...form.getInputProps("review_required", { type: "checkbox" })}
      />
      <Switch
        label="Mandatory"
        description="The parent can't complete until this task is done"
        {...form.getInputProps("is_mandatory", { type: "checkbox" })}
      />

      <Group justify="flex-end" gap="sm" mt="xs">
        <Button variant="default" onClick={onCancel}>
          Cancel
        </Button>
        <Button loading={isLoading} onClick={handleSubmit}>
          Create task
        </Button>
      </Group>
    </Stack>
  );
}
