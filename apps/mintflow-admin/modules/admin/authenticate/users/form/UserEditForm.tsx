"use client";

import { Button, Select, Stack, TextInput, useForm } from "@peppermint/ui";

import type {
  UserEditFormProps,
  UserEditFormValues,
} from "./UserEditForm.types";

const ACTOR_TYPE_OPTIONS = [
  { value: "human", label: "Human" },
  { value: "system", label: "System" },
  { value: "ai", label: "AI" },
  { value: "external", label: "External" },
];

export function UserEditForm({
  initialValues,
  onSubmit,
  isLoading,
}: UserEditFormProps) {
  const form = useForm<UserEditFormValues>({
    initialValues: {
      display_name: initialValues?.display_name ?? "",
      email: initialValues?.email ?? "",
      actor_type: initialValues?.actor_type ?? "human",
    },
    validate: {
      display_name: (value) => (!value ? "Required" : null),
      email: (value) =>
        value && !/^\S+@\S+\.\S+$/.test(value) ? "Invalid email" : null,
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
      <Stack gap="md" p="md">
        <TextInput
          label="Display Name"
          required
          disabled={isLoading}
          {...form.getInputProps("display_name")}
        />
        <TextInput
          label="Email"
          type="email"
          disabled={isLoading}
          {...form.getInputProps("email")}
        />
        <Select
          label="Actor Type"
          required
          data={ACTOR_TYPE_OPTIONS}
          disabled={isLoading}
          {...form.getInputProps("actor_type")}
        />
        <Button type="submit" loading={isLoading} fullWidth>
          Update User
        </Button>
      </Stack>
    </form>
  );
}
