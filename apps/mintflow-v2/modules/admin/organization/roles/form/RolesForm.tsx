"use client";

import { Stack, TextInput, Textarea, Select, Button, Text, Divider, useForm } from "@peppermint/ui";
import { PermissionsMatrix } from "../../_shared/PermissionsMatrix";
import type { Role } from "../roles.types";
import type { RolesFormProps } from "./RolesForm.types";

export function RolesForm({ initialValues, onSubmit, isLoading }: RolesFormProps) {
  const form = useForm<Role>({
    initialValues: {
      id: "",
      name: "",
      description: "",
      permissions: [],
      status: "active" as const,
      createdAt: "",
      updatedAt: "",
      ...initialValues,
    },
    validate: {
      name: (v) => (!v ? "Role name is required" : null),
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="md" p="md">
        <TextInput
          label="Role Name"
          placeholder="e.g. Manager"
          required
          disabled={isLoading}
          {...form.getInputProps("name")}
        />
        <Textarea
          label="Description"
          placeholder="Describe what this role can do"
          rows={3}
          disabled={isLoading}
          {...form.getInputProps("description")}
        />
        <Select
          label="Status"
          data={[
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
          disabled={isLoading}
          {...form.getInputProps("status")}
        />

        <Divider />

        <Text size="sm" fw={500}>Permissions</Text>
        <Text size="xs" c="dimmed">
          Select which actions this role can perform in each area of the system.
        </Text>

        <PermissionsMatrix
          value={form.values.permissions}
          onChange={(v) => form.setFieldValue("permissions", v)}
          disabled={isLoading}
        />

        <Button type="submit" loading={isLoading} fullWidth mt="sm">
          {initialValues?.id != null ? "Update Role" : "Create Role"}
        </Button>
      </Stack>
    </form>
  );
}
