"use client";

import {
  Button,
  DateInput,
  Select,
  Stack,
  Textarea,
  useForm,
  useQuery,
} from "@peppermint/ui";

import { UserPicker } from "@/modules/admin/authenticate/_shared/UserPicker";
import { ScopeFields } from "@/modules/admin/authenticate/_shared/ScopeFields";
import type { ScopeValue } from "@/modules/admin/authenticate/_shared/authenticate.types";
import { fetchAssignableRoles } from "@/modules/admin/authenticate/roles/roles.api";
import { roleQueryKeys } from "@/modules/admin/authenticate/roles/roles.queryKeys";
import type { RoleBinding } from "../bindings.types";
import type {
  RoleBindingFormProps,
  RoleBindingFormValues,
} from "./RoleBindingForm.types";

export function RoleBindingForm({ onSubmit, isLoading }: RoleBindingFormProps) {
  const { data: assignableRoles, isLoading: rolesLoading } = useQuery({
    queryKey: roleQueryKeys.assignable(),
    queryFn: fetchAssignableRoles,
    staleTime: 30_000,
  });

  const form = useForm<RoleBindingFormValues>({
    initialValues: {
      subject_user_id: null,
      role_id: null,
      scope_type: "global",
      organization: null,
      organization_unit: null,
      valid_from: null,
      valid_until: null,
      assignment_reason: "",
    },
    validate: {
      subject_user_id: (value) => (!value ? "Required" : null),
      role_id: (value) => (!value ? "Required" : null),
      organization: (value, values) =>
        values.scope_type !== "global" && !value ? "Required" : null,
      organization_unit: (value, values) =>
        values.scope_type === "organization_unit" && !value ? "Required" : null,
    },
  });

  const scopeValue: ScopeValue = {
    scope_type: form.values.scope_type,
    organization: form.values.organization,
    organization_unit: form.values.organization_unit,
  };

  return (
    <form
      onSubmit={form.onSubmit((values) =>
        onSubmit(values as unknown as RoleBinding),
      )}
    >
      <Stack gap="md" p="md">
        <UserPicker
          label="Subject user"
          required
          disabled={isLoading}
          value={form.values.subject_user_id}
          onChange={(userId) => form.setFieldValue("subject_user_id", userId)}
          error={form.errors.subject_user_id as string | undefined}
        />
        <Select
          label="Role"
          placeholder={rolesLoading ? "Loading roles..." : "Select role"}
          required
          searchable
          disabled={isLoading || rolesLoading}
          data={(assignableRoles ?? []).map((role) => ({
            value: role.id,
            label: `${role.display_name} (${role.key})`,
          }))}
          {...form.getInputProps("role_id")}
        />
        <ScopeFields
          value={scopeValue}
          disabled={isLoading}
          onChange={(next) => {
            form.setFieldValue("scope_type", next.scope_type);
            form.setFieldValue("organization", next.organization);
            form.setFieldValue("organization_unit", next.organization_unit);
          }}
        />
        <DateInput
          label="Valid from"
          clearable
          disabled={isLoading}
          {...form.getInputProps("valid_from")}
        />
        <DateInput
          label="Valid until"
          clearable
          disabled={isLoading}
          {...form.getInputProps("valid_until")}
        />
        <Textarea
          label="Assignment reason"
          autosize
          minRows={2}
          disabled={isLoading}
          {...form.getInputProps("assignment_reason")}
        />
        <Button type="submit" loading={isLoading} fullWidth>
          Create Binding
        </Button>
      </Stack>
    </form>
  );
}
