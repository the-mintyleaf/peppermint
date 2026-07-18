"use client";

import {
  Button,
  DatePickerInput,
  Group,
  Modal,
  Select,
  Stack,
  Textarea,
} from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import { z } from "zod";

import {
  ACTIVITY_TYPE,
  getWorkErrorMessage,
  SENSITIVITY_LEVEL,
  type ActivityType,
  type VisibilityClassification,
} from "@/lib/work";
import { useRecordActivity } from "../../../cases.mutations";
import type {
  ActivityFormValues,
  ActivityModalProps,
} from "./ActivityModal.types";

function humanize(value: string): string {
  const spaced = value.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

const ACTIVITY_TYPE_OPTIONS = ACTIVITY_TYPE.filter(
  (t) => t !== "system_activity" && t !== "correction",
).map((v) => ({ value: v, label: humanize(v) }));

const VISIBILITY_OPTIONS = SENSITIVITY_LEVEL.map((v) => ({
  value: v,
  label: humanize(v),
}));

/** A date-only picker value → an ISO datetime the backend's DateTimeField accepts. */
function toIsoDateTime(value: string | null): string {
  if (!value) return "";
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00Z` : value;
}

const schema = z.object({
  activity_type: z.string().min(1, "Pick an activity type"),
  description: z.string().trim().min(1, "Describe what happened"),
  occurred_at: z.string().min(1, "Pick a date"),
  visibility_classification: z.string(),
});

function ActivityFields({ onCancel }: { onCancel: () => void }) {
  const { form } = useFormInstance<ActivityFormValues>();
  const { handleSubmit, isLoading } = useFormControls();

  return (
    <Stack gap="md">
      <Select
        label="Activity type"
        placeholder="What kind of activity?"
        data={ACTIVITY_TYPE_OPTIONS}
        searchable
        required
        {...form.getInputProps("activity_type")}
      />
      <Textarea
        label="Description"
        placeholder="What was done"
        autosize
        minRows={3}
        required
        {...form.getInputProps("description")}
      />
      <DatePickerInput
        label="Occurred on"
        placeholder="Pick a date"
        required
        {...form.getInputProps("occurred_at")}
      />
      <Select
        label="Visibility"
        description="Optional — restricts who sees this entry"
        data={VISIBILITY_OPTIONS}
        clearable
        {...form.getInputProps("visibility_classification")}
      />
      <Group justify="flex-end" gap="sm" mt="xs">
        <Button variant="default" onClick={onCancel}>
          Cancel
        </Button>
        <Button loading={isLoading} onClick={handleSubmit}>
          Record activity
        </Button>
      </Group>
    </Stack>
  );
}

export function ActivityModal({ workId, opened, onClose }: ActivityModalProps) {
  const record = useRecordActivity(workId);

  async function submit(values: ActivityFormValues) {
    try {
      await record.mutateAsync({
        activity_type: values.activity_type as ActivityType,
        description: values.description.trim(),
        occurred_at: toIsoDateTime(values.occurred_at),
        visibility_classification: values.visibility_classification
          ? (values.visibility_classification as VisibilityClassification)
          : undefined,
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
      title="Record activity"
      centered
      radius="md"
      size={520}
      closeOnClickOutside={false}
    >
      <FormWrapper<ActivityFormValues>
        key={opened ? "open" : "closed"}
        initial={{
          activity_type: "",
          description: "",
          occurred_at: null,
          visibility_classification: "",
        }}
        validation={[schema]}
        finalSubmitFn={submit}
      >
        <ActivityFields onCancel={onClose} />
      </FormWrapper>
    </Modal>
  );
}
