"use client";

import {
  Button,
  Select,
  Stack,
  Textarea,
  TextInput,
  useForm,
} from "@peppermint/ui";
import { PositionPicker } from "../../_shared/PositionPicker";
import { UnitPicker } from "../../_shared/UnitPicker";
import { fetchAssignmentOptions } from "../delegations.api";
import type { Delegation, DelegationType } from "../delegations.types";
import type { DelegationsFormProps } from "./DelegationsForm.types";

const DELEGATION_TYPE_OPTIONS: { value: DelegationType; label: string }[] = [
  { value: "acting_authority", label: "Acting Authority" },
  { value: "temporary_supervision", label: "Temporary Supervision" },
  { value: "case_supervision", label: "Case Supervision" },
  { value: "approval_substitution", label: "Approval Substitution" },
  { value: "workload_transfer", label: "Workload Transfer" },
  { value: "emergency", label: "Emergency" },
  { value: "other", label: "Other" },
];

const EMPTY_UNIT_OPTIONS = async (_query: string) => [];

export function DelegationsForm({
  initialValues,
  onSubmit,
  isLoading,
  lockedFromNodeId,
  lockedFromName,
}: DelegationsFormProps) {
  const form = useForm<Partial<Delegation>>({
    initialValues: {
      from_assignment: lockedFromNodeId ?? initialValues?.from_assignment ?? "",
      to_assignment: initialValues?.to_assignment ?? "",
      delegation_type: initialValues?.delegation_type ?? "acting_authority",
      scope_unit: initialValues?.scope_unit ?? null,
      starts_at: initialValues?.starts_at
        ? initialValues.starts_at.slice(0, 10)
        : "",
      ends_at: initialValues?.ends_at ? initialValues.ends_at.slice(0, 10) : "",
      reason: initialValues?.reason ?? "",
    },
    validate: {
      from_assignment: (v) => (!v ? "Required" : null),
      to_assignment: (v, values) => {
        if (!v) return "Required";
        if (v === values.from_assignment)
          return "Cannot delegate to the same assignment";
        return null;
      },
      delegation_type: (v) => (!v ? "Required" : null),
      starts_at: (v) => (!v ? "Required" : null),
      reason: (v) => (!v ? "Required" : null),
    },
  });

  function handleSubmit(values: Partial<Delegation>) {
    const starts = values.starts_at ? `${values.starts_at}T00:00:00Z` : "";
    const ends = values.ends_at ? `${values.ends_at}T00:00:00Z` : null;
    onSubmit({
      ...values,
      starts_at: starts,
      ends_at: ends,
    } as Delegation);
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md" p="md">
        {lockedFromNodeId ? (
          <TextInput
            label="From (delegating)"
            value={lockedFromName ?? lockedFromNodeId}
            disabled
            required
          />
        ) : (
          <PositionPicker
            label="From (delegating)"
            required
            fetchOptions={fetchAssignmentOptions}
            value={(form.values.from_assignment as string) || null}
            onChange={(id) => form.setFieldValue("from_assignment", id ?? "")}
            error={form.errors.from_assignment as string | undefined}
            disabled={isLoading}
          />
        )}
        <PositionPicker
          label="To (receiving)"
          required
          fetchOptions={fetchAssignmentOptions}
          value={(form.values.to_assignment as string) || null}
          onChange={(id) => form.setFieldValue("to_assignment", id ?? "")}
          error={form.errors.to_assignment as string | undefined}
          disabled={isLoading}
        />
        <Select
          label="Delegation type"
          required
          data={DELEGATION_TYPE_OPTIONS}
          disabled={isLoading}
          {...form.getInputProps("delegation_type")}
        />
        <TextInput
          label="Starts at"
          type="date"
          required
          disabled={isLoading}
          {...form.getInputProps("starts_at")}
        />
        <TextInput
          label="Ends at"
          type="date"
          description="Leave blank for open-ended delegation"
          disabled={isLoading}
          {...form.getInputProps("ends_at")}
        />
        <UnitPicker
          label="Scope unit (optional)"
          fetchOptions={EMPTY_UNIT_OPTIONS}
          value={(form.values.scope_unit as string | null) ?? null}
          onChange={(id) => form.setFieldValue("scope_unit", id)}
          disabled={isLoading}
        />
        <Textarea
          label="Reason"
          required
          minRows={3}
          disabled={isLoading}
          {...form.getInputProps("reason")}
        />
        <Button type="submit" loading={isLoading} fullWidth>
          Create Delegation
        </Button>
      </Stack>
    </form>
  );
}
