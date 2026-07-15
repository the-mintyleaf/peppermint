"use client";

import {
  Button,
  Divider,
  Group,
  PasswordInput,
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
import type { CreateUserValues } from "../users.types";
import type { UserFormProps } from "./UserForm.types";

const schema = z.object({
  username: z
    .string()
    .min(3, "3–32 characters")
    .max(32, "3–32 characters")
    .regex(
      /^[a-z0-9](?:[a-z0-9._]*[a-z0-9])?$/,
      "Lowercase letters, numbers, dot or underscore",
    ),
  temporary_password: z.string().min(8, "At least 8 characters"),
  role: z.enum(["admin", "staff"]),
  employee_code: z
    .string()
    .min(1, "Required")
    .regex(
      /^[A-Z0-9][A-Z0-9-]*[A-Z0-9]$/,
      "Uppercase letters, numbers, hyphen",
    ),
  first_name: z.string().min(1, "Required"),
  last_name: z.string().min(1, "Required"),
  job_title: z.string().min(1, "Required"),
  employment_start_date: z.string().min(1, "Required"),
  middle_name: z.string(),
  preferred_name: z.string(),
  contact_email: z
    .string()
    .refine((v) => !v || /^\S+@\S+\.\S+$/.test(v), "Invalid email"),
  contact_phone: z.string(),
  remarks: z.string(),
});

const ROLE_OPTIONS = [
  { value: "staff", label: "Staff" },
  { value: "admin", label: "Admin" },
];

const INITIAL: CreateUserValues = {
  username: "",
  temporary_password: "",
  role: "staff",
  employee_code: "",
  first_name: "",
  last_name: "",
  job_title: "",
  employment_start_date: "",
  middle_name: "",
  preferred_name: "",
  contact_email: "",
  contact_phone: "",
  remarks: "",
};

/**
 * Create-account form for the Users admin. Uses `FormWrapper`; `finalSubmitFn` hands the
 * validated values to the shell's create mutation. The admin sets the temporary password,
 * which the caller re-shows once after creation.
 */
export function UserForm({ onSubmit, isLoading }: UserFormProps) {
  return (
    <FormWrapper<CreateUserValues>
      initial={INITIAL}
      validation={[schema]}
      finalSubmitFn={async (values) => {
        onSubmit(values);
        return { ok: true };
      }}
    >
      <Stack gap="md" p="md">
        <AccountFields isLoading={isLoading} />
        <Divider label="Employee profile" labelPosition="left" />
        <ProfileFields isLoading={isLoading} />
        <SubmitButton isLoading={isLoading} />
      </Stack>
    </FormWrapper>
  );
}

function AccountFields({ isLoading }: { isLoading: boolean }) {
  const { form } = useFormInstance<CreateUserValues>();
  return (
    <>
      <TextInput
        label="Username"
        required
        disabled={isLoading}
        {...form.getInputProps("username")}
      />
      <Group grow align="flex-start">
        <Select
          label="Role"
          required
          data={ROLE_OPTIONS}
          disabled={isLoading}
          {...form.getInputProps("role")}
        />
        <PasswordInput
          label="Temporary password"
          required
          description="The user must change it on first sign-in."
          disabled={isLoading}
          {...form.getInputProps("temporary_password")}
        />
      </Group>
    </>
  );
}

function ProfileFields({ isLoading }: { isLoading: boolean }) {
  const { form } = useFormInstance<CreateUserValues>();
  return (
    <>
      <Group grow align="flex-start">
        <TextInput
          label="Employee code"
          required
          disabled={isLoading}
          {...form.getInputProps("employee_code")}
        />
        <TextInput
          label="Job title"
          required
          disabled={isLoading}
          {...form.getInputProps("job_title")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="First name"
          required
          disabled={isLoading}
          {...form.getInputProps("first_name")}
        />
        <TextInput
          label="Middle name"
          disabled={isLoading}
          {...form.getInputProps("middle_name")}
        />
        <TextInput
          label="Last name"
          required
          disabled={isLoading}
          {...form.getInputProps("last_name")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Preferred name"
          disabled={isLoading}
          {...form.getInputProps("preferred_name")}
        />
        <TextInput
          label="Employment start date"
          type="date"
          required
          disabled={isLoading}
          {...form.getInputProps("employment_start_date")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Contact email"
          type="email"
          disabled={isLoading}
          {...form.getInputProps("contact_email")}
        />
        <TextInput
          label="Contact phone"
          disabled={isLoading}
          {...form.getInputProps("contact_phone")}
        />
      </Group>
      <Textarea
        label="Remarks"
        autosize
        minRows={2}
        disabled={isLoading}
        {...form.getInputProps("remarks")}
      />
      <Text size="xs" c="dimmed">
        The superadmin account can&apos;t be created here.
      </Text>
    </>
  );
}

function SubmitButton({ isLoading }: { isLoading: boolean }) {
  const { handleSubmit, isLoading: submitting } = useFormControls();
  return (
    <Button onClick={handleSubmit} loading={isLoading || submitting} fullWidth>
      Create user
    </Button>
  );
}
