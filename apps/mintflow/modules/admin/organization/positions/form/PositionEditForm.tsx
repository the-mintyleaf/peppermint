"use client";

import {
  Button,
  NumberInput,
  Select,
  Stack,
  Switch,
  Textarea,
  TextInput,
  useForm,
} from "@peppermint/ui";

import type { Position } from "../positions.types";
import type {
  PositionEditFormProps,
  PositionEditFormValues,
} from "./PositionEditForm.types";

const POSITION_TYPE_OPTIONS = [
  { value: "executive", label: "Executive" },
  { value: "head", label: "Head" },
  { value: "deputy_head", label: "Deputy Head" },
  { value: "manager", label: "Manager" },
  { value: "supervisor", label: "Supervisor" },
  { value: "officer", label: "Officer" },
  { value: "assistant", label: "Assistant" },
  { value: "specialist", label: "Specialist" },
  { value: "analyst", label: "Analyst" },
  { value: "auditor", label: "Auditor" },
  { value: "reviewer", label: "Reviewer" },
  { value: "field_staff", label: "Field Staff" },
  { value: "system_actor", label: "System Actor" },
  { value: "external_reviewer", label: "External Reviewer" },
  { value: "temporary", label: "Temporary" },
  { value: "other", label: "Other" },
];

const POSITION_STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "abolished", label: "Abolished" },
  { value: "archived", label: "Archived" },
];

export function PositionEditForm({
  initialValues,
  onSubmit,
  isLoading,
}: PositionEditFormProps) {
  const form = useForm<PositionEditFormValues>({
    initialValues: {
      title_np: initialValues?.title_np ?? "",
      title_en: initialValues?.title_en ?? "",
      sort_order: initialValues?.sort_order ?? 0,
      position_type: initialValues?.position_type ?? "",
      status: initialValues?.status ?? "draft",
      is_leadership: initialValues?.is_leadership ?? false,
      is_supervisory: initialValues?.is_supervisory ?? false,
      is_single_occupant: initialValues?.is_single_occupant ?? true,
      max_occupants: initialValues?.max_occupants ?? 1,
      description: initialValues?.description ?? "",
    },
    validate: {
      title_np: (value) => (!value ? "Required" : null),
      position_type: (value) => (!value ? "Required" : null),
    },
  });

  return (
    <form
      onSubmit={form.onSubmit((values) =>
        onSubmit({
          ...values,
          sort_order: Number(values.sort_order) || 0,
        } as unknown as Position),
      )}
    >
      <Stack gap="md" p="md">
        <TextInput
          label="Title (Nepali)"
          required
          disabled={isLoading}
          {...form.getInputProps("title_np")}
        />
        <TextInput
          label="Title (English)"
          disabled={isLoading}
          {...form.getInputProps("title_en")}
        />
        <NumberInput
          label="Sort order"
          min={0}
          disabled={isLoading}
          {...form.getInputProps("sort_order")}
        />
        <Select
          label="Position Type"
          required
          data={POSITION_TYPE_OPTIONS}
          disabled={isLoading}
          {...form.getInputProps("position_type")}
        />
        <Select
          label="Status"
          data={POSITION_STATUS_OPTIONS}
          disabled={isLoading}
          {...form.getInputProps("status")}
        />
        <Switch
          label="Leadership position"
          disabled={isLoading}
          {...form.getInputProps("is_leadership", { type: "checkbox" })}
        />
        <Switch
          label="Supervisory position"
          disabled={isLoading}
          {...form.getInputProps("is_supervisory", { type: "checkbox" })}
        />
        <Switch
          label="Single occupant"
          disabled={isLoading}
          {...form.getInputProps("is_single_occupant", { type: "checkbox" })}
        />
        <NumberInput
          label="Max Occupants"
          min={1}
          disabled={isLoading}
          {...form.getInputProps("max_occupants")}
        />
        <Textarea
          label="Description"
          minRows={2}
          autosize
          disabled={isLoading}
          {...form.getInputProps("description")}
        />
        <Button type="submit" loading={isLoading} fullWidth>
          Save Changes
        </Button>
      </Stack>
    </form>
  );
}
