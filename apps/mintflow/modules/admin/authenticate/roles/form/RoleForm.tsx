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

import type { RoleFormProps, RoleFormValues } from "./RoleForm.types";

const KEY_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;

export function RoleForm({ onSubmit, isLoading }: RoleFormProps) {
  const form = useForm<RoleFormValues>({
    initialValues: {
      key: "",
      display_name: "",
      description: "",
      role_type: "",
      is_system_role: false,
      is_assignable: true,
    },
    validate: {
      key: (value) =>
        !value
          ? "Required"
          : !KEY_PATTERN.test(value)
            ? "Lowercase letters, digits, hyphens, and underscores only"
            : null,
      display_name: (value) => (!value ? "Required" : null),
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
      <Stack gap="md" p="md">
        <TextInput
          label="Key"
          description="Slug format — lowercase letters, digits, hyphens, and underscores only."
          required
          disabled={isLoading}
          {...form.getInputProps("key")}
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
          label="System role"
          disabled={isLoading}
          {...form.getInputProps("is_system_role", { type: "checkbox" })}
        />
        <Text size="xs" c="dimmed">
          System role cannot be changed after creation.
        </Text>
        <Switch
          label="Assignable"
          disabled={isLoading}
          {...form.getInputProps("is_assignable", { type: "checkbox" })}
        />
        <Button type="submit" loading={isLoading} fullWidth>
          Create Role
        </Button>
      </Stack>
    </form>
  );
}
