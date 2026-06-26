"use client";

import {
  Button,
  NumberInput,
  Select,
  Stack,
  Switch,
  TextInput,
  Textarea,
  useForm,
} from "@peppermint/ui";
import { EffectiveDateRange } from "../../../_shared/EffectiveDateRange";
import {
  POSITION_STATUS_LABELS,
  POSITION_TYPE_LABELS,
} from "../../../organization.constants";
import type { PositionStatus, PositionType } from "../../positions.types";
import type {
  PositionsFormProps,
  PositionsFormValues,
} from "./PositionsForm.types";

const POSITION_TYPE_OPTIONS = (
  Object.entries(POSITION_TYPE_LABELS) as [PositionType, string][]
).map(([value, label]) => ({ value, label }));

const POSITION_STATUS_OPTIONS = (
  Object.entries(POSITION_STATUS_LABELS) as [PositionStatus, string][]
).map(([value, label]) => ({ value, label }));

export function PositionsForm({
  initialValues,
  onSubmit,
  isLoading = false,
  isEditing = false,
}: PositionsFormProps) {
  const form = useForm<PositionsFormValues>({
    initialValues: {
      title: initialValues?.title ?? "",
      code: initialValues?.code ?? "",
      position_type: initialValues?.position_type ?? "officer",
      description: initialValues?.description ?? "",
      is_leadership: initialValues?.is_leadership ?? false,
      is_supervisory: initialValues?.is_supervisory ?? false,
      is_single_occupant: initialValues?.is_single_occupant ?? true,
      max_occupants: initialValues?.max_occupants ?? 1,
      effective_from: initialValues?.effective_from ?? null,
      effective_to: initialValues?.effective_to ?? null,
      status: initialValues?.status ?? "draft",
    },
    validate: {
      title: (v) => (!v.trim() ? "Title is required" : null),
      position_type: (v) => (!v ? "Type is required" : null),
      max_occupants: (v, values) =>
        !values.is_single_occupant && v < 1 ? "Must be at least 1" : null,
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="md" p="md">
        <TextInput
          label="Title"
          placeholder="e.g. Senior Policy Officer"
          required
          disabled={isLoading}
          {...form.getInputProps("title")}
        />

        <TextInput
          label="Code"
          placeholder="spo-001"
          description="Unique code within this unit"
          disabled={isLoading || isEditing}
          {...form.getInputProps("code")}
        />

        <Select
          label="Position Type"
          placeholder="Select type"
          data={POSITION_TYPE_OPTIONS}
          required
          disabled={isLoading}
          {...form.getInputProps("position_type")}
        />

        <Textarea
          label="Description"
          placeholder="Responsibilities and scope of this position"
          autosize
          minRows={2}
          maxRows={4}
          disabled={isLoading}
          {...form.getInputProps("description")}
        />

        <Switch
          label="Leadership position"
          description="This position has leadership authority over others"
          disabled={isLoading}
          checked={form.values.is_leadership}
          onChange={(e) =>
            form.setFieldValue("is_leadership", e.currentTarget.checked)
          }
        />

        <Switch
          label="Supervisory position"
          description="This position directly supervises other staff"
          disabled={isLoading}
          checked={form.values.is_supervisory}
          onChange={(e) =>
            form.setFieldValue("is_supervisory", e.currentTarget.checked)
          }
        />

        <Switch
          label="Single occupant"
          description="Only one person can hold this position at a time"
          disabled={isLoading}
          checked={form.values.is_single_occupant}
          onChange={(e) =>
            form.setFieldValue("is_single_occupant", e.currentTarget.checked)
          }
        />

        {!form.values.is_single_occupant && (
          <NumberInput
            label="Max occupants"
            min={1}
            disabled={isLoading}
            {...form.getInputProps("max_occupants")}
          />
        )}

        <EffectiveDateRange
          value={{
            from: form.values.effective_from,
            to: form.values.effective_to,
          }}
          onChange={({ from, to }) => {
            form.setFieldValue("effective_from", from);
            form.setFieldValue("effective_to", to);
          }}
          disabled={isLoading}
        />

        <Select
          label="Status"
          data={POSITION_STATUS_OPTIONS}
          disabled={isLoading}
          {...form.getInputProps("status")}
        />

        <Button type="submit" loading={isLoading} fullWidth>
          {isEditing ? "Update Position" : "Create Position"}
        </Button>
      </Stack>
    </form>
  );
}
