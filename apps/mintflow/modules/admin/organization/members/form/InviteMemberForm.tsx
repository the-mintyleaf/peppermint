"use client";

import { Button, Stack, Switch, TextInput, useForm } from "@peppermint/ui";

import { UserPicker } from "@/modules/admin/authenticate/_shared/UserPicker";

import type { OrganizationMembership } from "../members.types";
import type {
  InviteMemberFormProps,
  InviteMemberFormValues,
} from "./InviteMemberForm.types";

export function InviteMemberForm({
  onSubmit,
  isLoading,
}: InviteMemberFormProps) {
  const form = useForm<InviteMemberFormValues>({
    initialValues: {
      user_id: null,
      employee_code: "",
      joined_at: "",
      is_primary: false,
    },
    validate: {
      user_id: (value) => (!value ? "Required" : null),
    },
  });

  return (
    <form
      onSubmit={form.onSubmit((values) =>
        onSubmit(values as unknown as OrganizationMembership),
      )}
    >
      <Stack gap="md" p="md">
        <UserPicker
          label="User"
          required
          disabled={isLoading}
          value={form.values.user_id}
          onChange={(userId) => form.setFieldValue("user_id", userId)}
          error={form.errors.user_id as string | undefined}
        />
        <TextInput
          label="Employee Code"
          disabled={isLoading}
          {...form.getInputProps("employee_code")}
        />
        <TextInput
          label="Joined At"
          type="date"
          disabled={isLoading}
          {...form.getInputProps("joined_at")}
        />
        <Switch
          label="Primary membership"
          disabled={isLoading}
          {...form.getInputProps("is_primary", { type: "checkbox" })}
        />
        <Button type="submit" loading={isLoading} fullWidth>
          Invite Member
        </Button>
      </Stack>
    </form>
  );
}
