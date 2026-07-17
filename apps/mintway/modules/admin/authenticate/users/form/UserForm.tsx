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
import { NameFieldGroup } from "@/components/NameFieldGroup";
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
        <EmployeeSection isLoading={isLoading} />
        <Divider label="Employment" labelPosition="left" />
        <EmploymentSection isLoading={isLoading} />
        <Divider label="Account access" labelPosition="left" />
        <AccountSection isLoading={isLoading} />
        <RemarksField isLoading={isLoading} />
        <Text size="xs" c="dimmed">
          The superadmin account can&apos;t be created here.
        </Text>
        <SubmitButton isLoading={isLoading} />
      </Stack>
    </FormWrapper>
  );
}

function RemarksField({ isLoading }: { isLoading: boolean }) {
  const { form } = useFormInstance<CreateUserValues>();
  return (
    <Textarea
      label="Remarks"
      placeholder="Anything the team should know about this account"
      autosize
      minRows={2}
      disabled={isLoading}
      {...form.getInputProps("remarks")}
    />
  );
}

function EmployeeSection({ isLoading }: { isLoading: boolean }) {
  const { form } = useFormInstance<CreateUserValues>();
  return (
    <>
      <NameFieldGroup
        required
        disabled={isLoading}
        firstName={form.getInputProps("first_name")}
        middleName={form.getInputProps("middle_name")}
        lastName={form.getInputProps("last_name")}
      />
      <TextInput
        label="Preferred name"
        placeholder="What they go by, if different"
        disabled={isLoading}
        {...form.getInputProps("preferred_name")}
      />
    </>
  );
}

function EmploymentSection({ isLoading }: { isLoading: boolean }) {
  const { form } = useFormInstance<CreateUserValues>();
  return (
    <>
      <Group grow align="flex-start">
        <TextInput
          label="Employee code"
          placeholder="EMP-014"
          required
          disabled={isLoading}
          {...form.getInputProps("employee_code")}
        />
        <TextInput
          label="Job title"
          placeholder="Registered Nurse"
          required
          disabled={isLoading}
          {...form.getInputProps("job_title")}
        />
      </Group>
      <TextInput
        label="Employment start date"
        type="date"
        required
        disabled={isLoading}
        {...form.getInputProps("employment_start_date")}
      />
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
    </>
  );
}

function AccountSection({ isLoading }: { isLoading: boolean }) {
  const { form } = useFormInstance<CreateUserValues>();
  return (
    <>
      <TextInput
        label="Username"
        placeholder="jsmith"
        required
        disabled={isLoading}
        {...form.getInputProps("username")}
      />
      <PasswordInput
        label="Temporary password"
        placeholder="At least 8 characters"
        required
        description="The user must change it on first sign-in."
        disabled={isLoading}
        {...form.getInputProps("temporary_password")}
      />
      <Select
        label="Role"
        required
        data={ROLE_OPTIONS}
        disabled={isLoading}
        {...form.getInputProps("role")}
      />
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
