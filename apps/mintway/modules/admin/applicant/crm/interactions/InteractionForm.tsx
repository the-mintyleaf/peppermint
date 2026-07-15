"use client";

import { z } from "zod";
import {
  Button,
  Checkbox,
  Group,
  Select,
  Stack,
  Textarea,
  TextInput,
} from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";

import {
  FOLLOW_UP_PRIORITY_LABELS,
  INTERACTION_DIRECTION_LABELS,
  INTERACTION_TYPE_LABELS,
  toOptions,
} from "../../_shared";
import type { Interaction } from "../../_shared";
import type {
  InteractionFormProps,
  InteractionFormValues,
  InteractionPayload,
} from "./InteractionForm.types";

const INTERACTION_TYPE_OPTIONS = toOptions(INTERACTION_TYPE_LABELS);
const INTERACTION_DIRECTION_OPTIONS = toOptions(INTERACTION_DIRECTION_LABELS);
const FOLLOW_UP_PRIORITY_OPTIONS = toOptions(FOLLOW_UP_PRIORITY_LABELS);

const VALIDATION = z.object({
  interaction_type: z.string().min(1, "Interaction type is required"),
  occurred_at: z.string().min(1, "Occurred at is required"),
});

const INITIAL: InteractionFormValues = {
  interaction_type: "inquiry",
  direction: "",
  occurred_at: "",
  summary: "",
  outcome: "",
  next_follow_up_at: "",
  follow_up_priority: "",
  is_confidential: false,
};

function toInitial(record?: Partial<Interaction>): InteractionFormValues {
  if (!record) return INITIAL;
  return {
    interaction_type: record.interaction_type ?? "inquiry",
    direction: record.direction ?? "",
    occurred_at: record.occurred_at ? record.occurred_at.slice(0, 16) : "",
    summary: record.summary ?? "",
    outcome: record.outcome ?? "",
    next_follow_up_at: record.next_follow_up_at
      ? record.next_follow_up_at.slice(0, 16)
      : "",
    follow_up_priority: record.follow_up_priority ?? "",
    is_confidential: Boolean(record.is_confidential),
  };
}

const TEXT_KEYS: (keyof InteractionFormValues)[] = ["summary", "outcome"];

/**
 * Build the api payload. Always send interaction_type + occurred_at + is_confidential.
 * On create, empty summary/outcome are dropped; on edit, blank text is sent so a cleared
 * field clears (PATCH). Empty datetime (next_follow_up_at) and empty enums (direction,
 * follow_up_priority) are always dropped (DRF rejects "" for those).
 */
function toPayload(
  values: InteractionFormValues,
  isEdit: boolean,
): InteractionPayload {
  const payload: Record<string, unknown> = {
    interaction_type: values.interaction_type,
    occurred_at: values.occurred_at,
    is_confidential: values.is_confidential,
  };
  for (const key of TEXT_KEYS) {
    const value = values[key];
    if (typeof value !== "string") continue;
    if (value !== "" || isEdit) payload[key] = value;
  }
  if (values.direction) payload.direction = values.direction;
  if (values.follow_up_priority)
    payload.follow_up_priority = values.follow_up_priority;
  if (values.next_follow_up_at)
    payload.next_follow_up_at = values.next_follow_up_at;
  return payload as InteractionPayload;
}

/**
 * Create/edit an applicant interaction (§8). Admin-only nested resource; a
 * locked/archived parent is rejected server-side and surfaced by the shell.
 */
export function InteractionForm({
  initialValues,
  onSubmit,
  isLoading,
}: InteractionFormProps) {
  const isEdit = Boolean(initialValues);
  return (
    <FormWrapper<InteractionFormValues>
      initial={toInitial(initialValues)}
      validation={[VALIDATION]}
      finalSubmitFn={async (values) => {
        onSubmit(toPayload(values, isEdit));
        return { ok: true };
      }}
    >
      <Stack gap="md" p="md">
        <Fields isLoading={isLoading} />
        <SubmitButton isLoading={isLoading} />
      </Stack>
    </FormWrapper>
  );
}

function Fields({ isLoading }: { isLoading: boolean }) {
  const { form } = useFormInstance<InteractionFormValues>();
  return (
    <>
      <Group grow align="flex-start">
        <Select
          label="Interaction type"
          withAsterisk
          data={INTERACTION_TYPE_OPTIONS}
          disabled={isLoading}
          {...form.getInputProps("interaction_type")}
        />
        <Select
          label="Direction"
          data={INTERACTION_DIRECTION_OPTIONS}
          clearable
          disabled={isLoading}
          {...form.getInputProps("direction")}
        />
      </Group>
      <TextInput
        label="Occurred at"
        type="datetime-local"
        withAsterisk
        disabled={isLoading}
        {...form.getInputProps("occurred_at")}
      />
      <Textarea
        label="Summary"
        autosize
        minRows={2}
        disabled={isLoading}
        {...form.getInputProps("summary")}
      />
      <Textarea
        label="Outcome"
        autosize
        minRows={2}
        disabled={isLoading}
        {...form.getInputProps("outcome")}
      />
      <Group grow align="flex-start">
        <TextInput
          label="Next follow-up at"
          type="datetime-local"
          disabled={isLoading}
          {...form.getInputProps("next_follow_up_at")}
        />
        <Select
          label="Follow-up priority"
          data={FOLLOW_UP_PRIORITY_OPTIONS}
          clearable
          disabled={isLoading}
          {...form.getInputProps("follow_up_priority")}
        />
      </Group>
      <Checkbox
        label="Confidential"
        disabled={isLoading}
        {...form.getInputProps("is_confidential", { type: "checkbox" })}
      />
    </>
  );
}

function SubmitButton({ isLoading }: { isLoading: boolean }) {
  const { handleSubmit, isLoading: submitting } = useFormControls();
  return (
    <Button onClick={handleSubmit} loading={isLoading || submitting} fullWidth>
      Save interaction
    </Button>
  );
}
