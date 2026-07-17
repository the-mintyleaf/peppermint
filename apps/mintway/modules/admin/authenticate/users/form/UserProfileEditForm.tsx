"use client";

import {
  Button,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import { z } from "zod";
import type { ProfileUpdateValues } from "../users.types";
import { NameFieldGroup } from "./NameFieldGroup";
import type { UserProfileEditFormProps } from "./UserProfileEditForm.types";

const schema = z.object({
  first_name: z.string().min(1, "Required"),
  last_name: z.string().min(1, "Required"),
  job_title: z.string().min(1, "Required"),
  middle_name: z.string(),
  preferred_name: z.string(),
  contact_email: z
    .string()
    .refine((v) => !v || /^\S+@\S+\.\S+$/.test(v), "Invalid email"),
  contact_phone: z.string(),
  employment_end_date: z.string(),
  employment_status: z.enum(["active", "ended"]),
  remarks: z.string(),
});

const EMPLOYMENT_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "ended", label: "Ended" },
];

/**
 * Edit an account's employee profile (`PATCH /users/<id>/profile/`). Only non-security
 * fields are editable — username, role, employee code, and start date are read-only.
 */
export function UserProfileEditForm({
  onSubmit,
  isLoading,
  initialValues,
}: UserProfileEditFormProps) {
  const p = initialValues?.employee_profile;
  const initial: ProfileUpdateValues = {
    first_name: p?.first_name ?? "",
    middle_name: p?.middle_name ?? "",
    last_name: p?.last_name ?? "",
    preferred_name: p?.preferred_name ?? "",
    job_title: p?.job_title ?? "",
    contact_email: p?.email ?? "",
    contact_phone: p?.phone ?? "",
    employment_end_date: p?.employment_end_date ?? "",
    employment_status: p?.employment_status ?? "active",
    remarks: p?.remarks ?? "",
  };

  return (
    <FormWrapper<ProfileUpdateValues>
      initial={initial}
      validation={[schema]}
      finalSubmitFn={async (values) => {
        onSubmit(values);
        return { ok: true };
      }}
    >
      <Stack gap="md" p="md">
        <ReadOnlySummary
          username={initialValues?.username}
          role={initialValues?.role}
          employeeCode={p?.employee_code}
          startDate={p?.employment_start_date}
        />
        <Fields isLoading={isLoading} />
        <SubmitButton isLoading={isLoading} />
      </Stack>
    </FormWrapper>
  );
}

function ReadOnlySummary({
  username,
  role,
  employeeCode,
  startDate,
}: {
  username?: string;
  role?: string;
  employeeCode?: string;
  startDate?: string;
}) {
  return (
    <Text size="xs" c="dimmed">
      {username ?? "—"} · {role ?? "—"} · {employeeCode ?? "—"} · started{" "}
      {startDate ?? "—"} (not editable here)
    </Text>
  );
}

function Fields({ isLoading }: { isLoading: boolean }) {
  const { form } = useFormInstance<ProfileUpdateValues>();
  return (
    <>
      <NameFieldGroup
        required
        disabled={isLoading}
        firstName={form.getInputProps("first_name")}
        middleName={form.getInputProps("middle_name")}
        lastName={form.getInputProps("last_name")}
      />
      <Group grow align="flex-start">
        <TextInput
          label="Preferred name"
          placeholder="What they go by, if different"
          disabled={isLoading}
          {...form.getInputProps("preferred_name")}
        />
        <TextInput
          label="Job title"
          placeholder="Registered Nurse"
          required
          disabled={isLoading}
          {...form.getInputProps("job_title")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Contact email"
          type="email"
          placeholder="name@company.com"
          disabled={isLoading}
          {...form.getInputProps("contact_email")}
        />
        <TextInput
          label="Contact phone"
          placeholder="+1 555 010 4477"
          disabled={isLoading}
          {...form.getInputProps("contact_phone")}
        />
      </Group>
      <Group grow align="flex-start">
        <Select
          label="Employment status"
          data={EMPLOYMENT_STATUS_OPTIONS}
          disabled={isLoading}
          {...form.getInputProps("employment_status")}
        />
        <TextInput
          label="Employment end date"
          type="date"
          disabled={isLoading}
          {...form.getInputProps("employment_end_date")}
        />
      </Group>
      <Textarea
        label="Remarks"
        placeholder="Anything the team should know about this account"
        autosize
        minRows={2}
        disabled={isLoading}
        {...form.getInputProps("remarks")}
      />
    </>
  );
}

function SubmitButton({ isLoading }: { isLoading: boolean }) {
  const { handleSubmit, isLoading: submitting } = useFormControls();
  return (
    <Button onClick={handleSubmit} loading={isLoading || submitting} fullWidth>
      Save profile
    </Button>
  );
}
