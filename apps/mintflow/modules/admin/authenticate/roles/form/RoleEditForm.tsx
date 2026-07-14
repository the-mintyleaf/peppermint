"use client";

import {
  Button,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  useForm,
} from "@peppermint/ui";

import type {
  RoleEditFormProps,
  RoleEditFormValues,
} from "./RoleEditForm.types";

export function RoleEditForm({
  initialValues,
  onSubmit,
  isLoading,
}: RoleEditFormProps) {
  const form = useForm<RoleEditFormValues>({
    initialValues: {
      display_name: initialValues?.display_name ?? "",
      description: initialValues?.description ?? "",
      role_type: initialValues?.role_type ?? "",
      is_assignable: initialValues?.is_assignable ?? true,
    },
    validate: {
      display_name: (value) => (!value ? "Required" : null),
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
      <Stack gap="md" p="md">
        <TextInput
          label="Key"
          value={initialValues?.key ?? ""}
          disabled
          readOnly
          description="Key cannot be changed after creation."
        />
        <TextInput
          label="Display Name"
          required
          disabled={isLoading}
          {...form.getInputProps("display_name")}
        />
        <Textarea
          label="Description"
          autosize
          minRows={2}
          disabled={isLoading}
          {...form.getInputProps("description")}
        />
        <TextInput
          label="Role Type"
          disabled={isLoading}
          {...form.getInputProps("role_type")}
        />
        <Switch
          label="Assignable"
          disabled={isLoading}
          {...form.getInputProps("is_assignable", { type: "checkbox" })}
        />
        {initialValues?.is_system_role && (
          <Text size="xs" c="dimmed">
            This is a system role. System role status cannot be changed.
          </Text>
        )}
        <Button type="submit" loading={isLoading} fullWidth>
          Update Role
        </Button>
      </Stack>
    </form>
  );
}
