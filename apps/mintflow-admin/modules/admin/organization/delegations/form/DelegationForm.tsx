"use client";

import { useParams } from "next/navigation";
import {
  Alert,
  Button,
  Select,
  Stack,
  TextInput,
  useForm,
} from "@peppermint/ui";
import { InfoIcon } from "@phosphor-icons/react/dist/csr/Info";

import { AssignmentPickerSelect } from "../../_shared/components/AssignmentPickerSelect";
import { ReasonTextarea } from "../../_shared/components/ReasonTextarea";
import { UnitPickerSelect } from "../../_shared/components/UnitPickerSelect";
import type {
  DelegationFormProps,
  DelegationFormValues,
} from "./DelegationForm.types";

const DELEGATION_TYPE_OPTIONS = [
  { value: "acting_authority", label: "Acting Authority" },
  { value: "temporary_supervision", label: "Temporary Supervision" },
  { value: "case_supervision", label: "Case Supervision" },
  { value: "approval_substitution", label: "Approval Substitution" },
  { value: "workload_transfer", label: "Workload Transfer" },
  { value: "emergency", label: "Emergency" },
  { value: "other", label: "Other" },
];

export function DelegationForm({ onSubmit, isLoading }: DelegationFormProps) {
  const { orgId = "" } = useParams<{ orgId: string }>();
  const form = useForm<DelegationFormValues>({
    initialValues: {
      from_assignment_id: null,
      to_assignment_id: null,
      delegation_type: "",
      scope_unit: null,
      starts_at: "",
      ends_at: "",
      reason: "",
    },
    validate: {
      from_assignment_id: (value) => (!value ? "Required" : null),
      to_assignment_id: (value, values) => {
        if (!value) return "Required";
        if (value === values.from_assignment_id) {
          return "Can't delegate to the same assignment";
        }
        return null;
      },
      delegation_type: (value) => (!value ? "Required" : null),
      starts_at: (value) => (!value ? "Required" : null),
      ends_at: (value, values) => {
        if (value && values.starts_at && value <= values.starts_at) {
          return "End date must be after the start date";
        }
        return null;
      },
      reason: (value) => (!value ? "Required" : null),
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
      <Stack gap="md" p="md">
        <Alert
          variant="light"
          color="blue"
          icon={<InfoIcon size={16} aria-hidden />}
        >
          Delegations do not directly grant permissions in this version — the
          assignment&apos;s own permissions still apply.
        </Alert>

        <AssignmentPickerSelect
          organizationId={orgId}
          label="From Assignment"
          required
          disabled={isLoading}
          value={form.values.from_assignment_id}
          onChange={(id) => form.setFieldValue("from_assignment_id", id)}
          error={form.errors.from_assignment_id as string | undefined}
        />
        <AssignmentPickerSelect
          organizationId={orgId}
          label="To Assignment"
          required
          disabled={isLoading}
          value={form.values.to_assignment_id}
          onChange={(id) => form.setFieldValue("to_assignment_id", id)}
          error={form.errors.to_assignment_id as string | undefined}
        />
        <Select
          label="Delegation Type"
          required
          data={DELEGATION_TYPE_OPTIONS}
          disabled={isLoading}
          {...form.getInputProps("delegation_type")}
        />
        <UnitPickerSelect
          organizationId={orgId}
          label="Scope Unit"
          placeholder="Optional — narrows the delegation to one unit"
          disabled={isLoading}
          value={form.values.scope_unit}
          onChange={(id) => form.setFieldValue("scope_unit", id)}
        />
        <TextInput
          label="Starts At"
          type="date"
          required
          disabled={isLoading}
          {...form.getInputProps("starts_at")}
        />
        <TextInput
          label="Ends At"
          type="date"
          description="Leave blank for an indefinite delegation"
          disabled={isLoading}
          {...form.getInputProps("ends_at")}
        />
        <ReasonTextarea
          value={form.values.reason}
          onChange={(value) => form.setFieldValue("reason", value)}
          required
          placeholder="e.g. Director on leave."
          error={form.errors.reason as string | undefined}
        />
        <Button type="submit" loading={isLoading} fullWidth>
          Create Delegation
        </Button>
      </Stack>
    </form>
  );
}
