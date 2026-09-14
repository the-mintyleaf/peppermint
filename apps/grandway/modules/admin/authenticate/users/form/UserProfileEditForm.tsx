"use client";

import { Button, Group, Stack, Text, TextInput } from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import { z } from "zod";
import type { UpdateUserValues } from "../users.types";
import type { UserProfileEditFormProps } from "./UserForm.types";

const schema = z.object({
  display_name: z.string().min(1, "Required"),
  full_name: z.string(),
  email: z
    .string()
    .refine((v) => !v || /^\S+@\S+\.\S+$/.test(v), "Invalid email"),
  phone: z.string(),
});

/**
 * Edit an account's profile fields (`PATCH /api/v1/auth/users/<id>/`,
 * `authenticate/docs/INTEGRATION.md` §7). `username` and `authority_type` are immutable
 * here — shown read-only, not editable.
 */
export function UserProfileEditForm({
  onSubmit,
  isLoading,
  initialValues,
}: UserProfileEditFormProps) {
  const initial: UpdateUserValues = {
    display_name: initialValues?.display_name ?? "",
    full_name: initialValues?.full_name ?? "",
    email: initialValues?.email ?? "",
    phone: initialValues?.phone ?? "",
  };

  return (
    <FormWrapper<UpdateUserValues>
      initial={initial}
      validation={[schema]}
      finalSubmitFn={async (values) => {
        onSubmit(values);
        return { ok: true };
      }}
    >
      <Stack gap="md" p="md">
        <Text size="xs" c="dimmed">
          {initialValues?.username ?? "—"} ·{" "}
          {initialValues?.authority_type ?? "—"} (username and authority
          aren&apos;t editable here)
        </Text>
        <Fields isLoading={isLoading} />
        <SubmitButton isLoading={isLoading} />
      </Stack>
    </FormWrapper>
  );
}

function Fields({ isLoading }: { isLoading: boolean }) {
  const { form } = useFormInstance<UpdateUserValues>();
  return (
    <>
      <TextInput
        label="Display name"
        required
        disabled={isLoading}
        {...form.getInputProps("display_name")}
      />
      <TextInput
        label="Full name"
        disabled={isLoading}
        {...form.getInputProps("full_name")}
      />
      <Group grow align="flex-start">
        <TextInput
          label="Email"
          type="email"
          disabled={isLoading}
          {...form.getInputProps("email")}
        />
        <TextInput
          label="Phone"
          disabled={isLoading}
          {...form.getInputProps("phone")}
        />
      </Group>
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
