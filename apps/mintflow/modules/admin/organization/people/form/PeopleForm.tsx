"use client";

import {
  Button,
  DateInput,
  Stack,
  Switch,
  Text,
  TextInput,
  useForm,
} from "@peppermint/ui";
import { UserPicker } from "../../_shared/UserPicker";
import { searchUsers } from "../people.api";
import type { PeopleFormProps, PeopleFormValues } from "./peopleForm.types";

export function PeopleForm({ onSubmit, isLoading = false }: PeopleFormProps) {
  const form = useForm<PeopleFormValues>({
    initialValues: {
      user_id: "",
      employee_code: "",
      joined_at: null,
      is_primary: false,
    },
    validate: {
      user_id: (v) => (!v ? "User is required" : null),
      employee_code: (v) =>
        v && v.length > 50 ? "Must be 50 characters or fewer" : null,
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="md" p="md">
        <UserPicker
          label="User"
          value={form.values.user_id || null}
          onChange={(userId) => form.setFieldValue("user_id", userId ?? "")}
          fetchOptions={searchUsers}
          required
          disabled={isLoading}
          error={form.errors.user_id as string | undefined}
        />

        <TextInput
          label="Employee Code"
          placeholder="MOH-001"
          description="Optional org-specific identifier for HR and payroll systems"
          disabled={isLoading}
          {...form.getInputProps("employee_code")}
        />

        <DateInput
          label="Joined At"
          placeholder="Select join date"
          description="When this person joined the organization (optional)"
          clearable
          disabled={isLoading}
          value={form.values.joined_at ? new Date(form.values.joined_at) : null}
          onChange={(date) => {
            if (!date) {
              form.setFieldValue("joined_at", null);
              return;
            }
            form.setFieldValue("joined_at", new Date(date).toISOString());
          }}
        />

        <Switch
          label="Primary organization"
          description="Mark this as the person's main organizational affiliation"
          disabled={isLoading}
          checked={form.values.is_primary}
          onChange={(e) =>
            form.setFieldValue("is_primary", e.currentTarget.checked)
          }
        />

        <Text size="xs" c="dimmed">
          New members start with Invited status. Activate them after onboarding
          is complete.
        </Text>

        <Button type="submit" loading={isLoading} fullWidth>
          Add Member
        </Button>
      </Stack>
    </form>
  );
}
