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

import type {
  PositionFormProps,
  PositionFormValues,
} from "./PositionForm.types";

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

const CODE_PATTERN = /^[A-Za-z0-9_\-]+$/;

export function PositionForm({ onSubmit, isLoading }: PositionFormProps) {
  const form = useForm<PositionFormValues>({
    initialValues: {
      title_np: "",
      title_en: "",
      sort_order: 0,
      code: "",
      position_type: "",
      is_leadership: false,
      is_supervisory: false,
      is_single_occupant: true,
      max_occupants: 1,
      description: "",
    },
    validate: {
      title_np: (value) => (!value ? "Required" : null),
      code: (value) => {
        if (!value) return "Required";
        if (!CODE_PATTERN.test(value)) {
          return "Letters, numbers, underscore, and hyphen only";
        }
        return null;
      },
      position_type: (value) => (!value ? "Required" : null),
    },
  });

  return (
    <form
      onSubmit={form.onSubmit((values) =>
        onSubmit({
          ...values,
          sort_order: Number(values.sort_order) || 0,
        }),
      )}
    >
      <Stack gap="md" p="md">
        <TextInput
          label="Title (Nepali)"
          placeholder="जनस्वास्थ्य निर्देशक"
          required
          disabled={isLoading}
          {...form.getInputProps("title_np")}
        />
        <TextInput
          label="Title (English)"
          placeholder="Director of Public Health"
          disabled={isLoading}
          {...form.getInputProps("title_en")}
        />
        <NumberInput
          label="Sort order"
          min={0}
          disabled={isLoading}
          {...form.getInputProps("sort_order")}
        />
        <TextInput
          label="Code"
          description="Unique within this organization"
          required
          disabled={isLoading}
          {...form.getInputProps("code")}
        />
        <Select
          label="Position Type"
          required
          data={POSITION_TYPE_OPTIONS}
          disabled={isLoading}
          {...form.getInputProps("position_type")}
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
          Create Position
        </Button>
      </Stack>
    </form>
  );
}
