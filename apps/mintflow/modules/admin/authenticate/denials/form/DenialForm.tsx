"use client";

import {
  Alert,
  Button,
  Select,
  Stack,
  Textarea,
  useForm,
} from "@peppermint/ui";
import { InfoIcon } from "@phosphor-icons/react/dist/csr/Info";
import { PermissionKeyPicker } from "@/modules/admin/authenticate/_shared/PermissionKeyPicker";
import { ScopeFields } from "@/modules/admin/authenticate/_shared/ScopeFields";
import { UserPicker } from "@/modules/admin/authenticate/_shared/UserPicker";
import type { DenialFormProps, DenialFormValues } from "./DenialForm.types";

const SEVERITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const INITIAL_VALUES: DenialFormValues = {
  subject_user_id: null,
  permission_key: null,
  scope_type: "global",
  organization: null,
  organization_unit: null,
  reason: "",
  severity: "medium",
};

export function DenialForm({ onSubmit, isLoading }: DenialFormProps) {
  const form = useForm<DenialFormValues>({
    initialValues: INITIAL_VALUES,
    validate: {
      subject_user_id: (value) => (!value ? "Select a user" : null),
      permission_key: (value) => (!value ? "Select a permission" : null),
      organization: (value, values) =>
        values.scope_type !== "global" && !value
          ? "Select an organization"
          : null,
      organization_unit: (value, values) =>
        values.scope_type === "organization_unit" && !value
          ? "Select a unit"
          : null,
      reason: (value) => (!value.trim() ? "Reason is required" : null),
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    onSubmit(values);
  });

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md" p="md">
        <Alert
          variant="light"
          color="blue"
          icon={<InfoIcon size={16} aria-hidden />}
        >
          Denials override grants and role permissions for this user and scope.
        </Alert>

        <UserPicker
          label="User"
          required
          disabled={isLoading}
          value={form.values.subject_user_id}
          onChange={(userId) => form.setFieldValue("subject_user_id", userId)}
          error={form.errors.subject_user_id as string | undefined}
        />

        <PermissionKeyPicker
          required
          disabled={isLoading}
          value={form.values.permission_key}
          onChange={(key) => form.setFieldValue("permission_key", key)}
          error={form.errors.permission_key as string | undefined}
        />

        <ScopeFields
          value={{
            scope_type: form.values.scope_type,
            organization: form.values.organization,
            organization_unit: form.values.organization_unit,
          }}
          onChange={(scope) =>
            form.setValues({
              scope_type: scope.scope_type,
              organization: scope.organization,
              organization_unit: scope.organization_unit,
            })
          }
          disabled={isLoading}
          error={
            (form.errors.organization as string | undefined) ??
            (form.errors.organization_unit as string | undefined)
          }
        />

        <Select
          label="Severity"
          required
          disabled={isLoading}
          data={SEVERITY_OPTIONS}
          {...form.getInputProps("severity")}
        />

        <Textarea
          label="Reason"
          placeholder="Why is this permission being denied?"
          required
          minRows={2}
          disabled={isLoading}
          {...form.getInputProps("reason")}
        />

        <Button type="submit" loading={isLoading} fullWidth>
          Create Denial
        </Button>
      </Stack>
    </form>
  );
}
