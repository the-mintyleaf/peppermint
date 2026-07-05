"use client";

import { useParams } from "next/navigation";
import { Button, Select, Stack, Switch, useForm } from "@peppermint/ui";

import { PositionPickerSelect } from "../../_shared/components/PositionPickerSelect";
import { ReasonTextarea } from "../../_shared/components/ReasonTextarea";
import type { ReportingLine } from "../reportingLines.types";
import type {
  ReportingLineFormProps,
  ReportingLineFormValues,
} from "./ReportingLineForm.types";

const REPORTING_LINE_TYPE_OPTIONS = [
  { value: "administrative", label: "Administrative" },
  { value: "functional", label: "Functional" },
  { value: "disciplinary", label: "Disciplinary" },
  { value: "technical", label: "Technical" },
  { value: "project", label: "Project" },
  { value: "case_specific", label: "Case Specific" },
  { value: "temporary", label: "Temporary" },
  { value: "matrix", label: "Matrix" },
  { value: "other", label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "planned", label: "Planned" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
];

export function ReportingLineForm({
  onSubmit,
  isLoading,
}: ReportingLineFormProps) {
  const { orgId = "" } = useParams<{ orgId: string }>();
  const form = useForm<ReportingLineFormValues>({
    initialValues: {
      source_position_id: null,
      target_position_id: null,
      reporting_line_type: "",
      status: "active",
      is_primary: true,
      reason: "",
    },
    validate: {
      source_position_id: (value) => (!value ? "Required" : null),
      target_position_id: (value, values) => {
        if (!value) return "Required";
        if (value === values.source_position_id) {
          return "A position can't report to itself";
        }
        return null;
      },
      reporting_line_type: (value) => (!value ? "Required" : null),
    },
  });

  return (
    <form
      onSubmit={form.onSubmit((values) =>
        onSubmit(values as unknown as ReportingLine),
      )}
    >
      <Stack gap="md" p="md">
        <PositionPickerSelect
          organizationId={orgId}
          label="Source Position (reports to target)"
          required
          disabled={isLoading}
          value={form.values.source_position_id}
          onChange={(id) => form.setFieldValue("source_position_id", id)}
          error={form.errors.source_position_id as string | undefined}
        />
        <PositionPickerSelect
          organizationId={orgId}
          label="Target Position (receives the report)"
          required
          disabled={isLoading}
          value={form.values.target_position_id}
          onChange={(id) => form.setFieldValue("target_position_id", id)}
          error={form.errors.target_position_id as string | undefined}
        />
        <Select
          label="Reporting Line Type"
          required
          data={REPORTING_LINE_TYPE_OPTIONS}
          disabled={isLoading}
          {...form.getInputProps("reporting_line_type")}
        />
        <Select
          label="Status"
          data={STATUS_OPTIONS}
          disabled={isLoading}
          {...form.getInputProps("status")}
        />
        <Switch
          label="Primary reporting line"
          disabled={isLoading}
          {...form.getInputProps("is_primary", { type: "checkbox" })}
        />
        <ReasonTextarea
          value={form.values.reason}
          onChange={(value) => form.setFieldValue("reason", value)}
          placeholder="e.g. Public Health Division reports to Health Directorate."
        />
        <Button type="submit" loading={isLoading} fullWidth>
          Create Reporting Line
        </Button>
      </Stack>
    </form>
  );
}
