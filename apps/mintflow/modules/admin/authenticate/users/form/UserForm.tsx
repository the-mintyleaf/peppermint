"use client";

import {
  Button,
  PasswordInput,
  Select,
  Stack,
  Switch,
  TextInput,
  useForm,
} from "@peppermint/ui";

import type { UserFormProps, UserFormValues } from "./UserForm.types";

const ACTOR_TYPE_OPTIONS = [
  { value: "human", label: "Human" },
  { value: "system", label: "System" },
  { value: "ai", label: "AI" },
  { value: "external", label: "External" },
];

const ACCOUNT_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "deactivated", label: "Deactivated" },
  { value: "archived", label: "Archived" },
];

export function UserForm({ onSubmit, isLoading }: UserFormProps) {
  const form = useForm<UserFormValues>({
    initialValues: {
      username: "",
      display_name: "",
      email: "",
      actor_type: "human",
      account_status: "pending",
      is_login_enabled: true,
      password: "",
    },
    validate: {
      username: (value) => (!value ? "Required" : null),
      display_name: (value) => (!value ? "Required" : null),
      email: (value) =>
        value && !/^\S+@\S+\.\S+$/.test(value) ? "Invalid email" : null,
      password: (value, values) =>
        values.actor_type === "human" && !value
          ? "Password is required for human users"
          : null,
    },
  });

  const isHuman = form.values.actor_type === "human";

  return (
    <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
      <Stack gap="md" p="md">
        <TextInput
          label="Username"
          required
          disabled={isLoading}
          {...form.getInputProps("username")}
        />
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
        <Select
          label="Account Status"
          required
          data={ACCOUNT_STATUS_OPTIONS}
          disabled={isLoading}
          {...form.getInputProps("account_status")}
        />
        <Switch
          label="Login enabled"
          disabled={isLoading}
          {...form.getInputProps("is_login_enabled", { type: "checkbox" })}
        />
        {isHuman && (
          <PasswordInput
            label="Password"
            required
            disabled={isLoading}
            {...form.getInputProps("password")}
          />
        )}
        <Button type="submit" loading={isLoading} fullWidth>
          Create User
        </Button>
      </Stack>
    </form>
  );
}
