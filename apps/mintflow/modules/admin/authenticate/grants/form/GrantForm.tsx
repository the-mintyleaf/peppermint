"use client";

import { Button, Stack, Textarea, useForm } from "@peppermint/ui";
import { PermissionKeyPicker } from "@/modules/admin/authenticate/_shared/PermissionKeyPicker";
import { ScopeFields } from "@/modules/admin/authenticate/_shared/ScopeFields";
import { UserPicker } from "@/modules/admin/authenticate/_shared/UserPicker";
import type { GrantFormProps, GrantFormValues } from "./GrantForm.types";

const INITIAL_VALUES: GrantFormValues = {
  subject_user_id: null,
  permission_key: null,
  scope_type: "global",
  organization: null,
  organization_unit: null,
  reason: "",
  approved_by_id: null,
};

export function GrantForm({ onSubmit, isLoading }: GrantFormProps) {
  const form = useForm<GrantFormValues>({
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
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    onSubmit(values);
  });

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md" p="md">
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

        <Textarea
          label="Reason"
          placeholder="Optional context for this grant"
          minRows={2}
          disabled={isLoading}
          {...form.getInputProps("reason")}
        />

        <UserPicker
          label="Approved by"
          placeholder="Optional — search by username or name"
          disabled={isLoading}
          value={form.values.approved_by_id}
          onChange={(userId) => form.setFieldValue("approved_by_id", userId)}
        />

        <Button type="submit" loading={isLoading} fullWidth>
          Create Grant
        </Button>
      </Stack>
    </form>
  );
}
