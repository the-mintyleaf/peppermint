"use client";

import { Stack, Select, Text, Divider } from "@peppermint/ui";
import { useFormInstance } from "@peppermint/admin";
import { useQuery } from "@peppermint/ui";
import { PermissionsMatrix } from "../../../_shared/PermissionsMatrix";
import { fetchRoleOptions } from "../../../roles/roles.api";
import type { AccountFormValues } from "../accountsForm.types";
import type { PermissionSet } from "../../../_shared/PermissionsMatrix";

export function StepRolePermissions() {
  const { form } = useFormInstance<AccountFormValues>();

  const { data: roleOptions = [] } = useQuery({
    queryKey: ["role-options"],
    queryFn: fetchRoleOptions,
  });

  return (
    <Stack gap="md">
      <Select
        label="Assigned Role"
        placeholder="Select a role"
        required
        data={roleOptions}
        {...form.getInputProps("roleId")}
      />

      <Divider />

      <Text size="sm" fw={500}>Personalized Permissions</Text>
      <Text size="xs" c="dimmed">
        These permissions are added on top of (or override) the assigned role permissions.
        Leave empty to inherit role permissions only.
      </Text>

      <PermissionsMatrix
        value={form.values.personalizedPermissions as PermissionSet[]}
        onChange={(v) => form.setFieldValue("personalizedPermissions", v)}
      />
    </Stack>
  );
}
