"use client";

import {
  Button,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import { z } from "zod";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
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
  display_name: z.string().min(1, "Required"),
  full_name_np: z.string(),
  full_name_en: z.string(),
  email: z
    .string()
    .refine((v) => !v || /^\S+@\S+\.\S+$/.test(v), "Invalid email"),
  phone: z.string(),
  password: z.string(),
});

const INITIAL: CreateUserValues = {
  username: "",
  display_name: "",
  full_name_np: "",
  full_name_en: "",
  email: "",
  phone: "",
  password: "",
};

/**
 * Create-account form for the Users admin (`POST /api/v1/auth/users/`,
 * `authenticate/docs/INTEGRATION.md` §7). `authority_type` is fixed to the tier the
 * caller manages (a superadmin creates admins, an admin creates lead managers) — it is
 * computed by the caller, not offered as a picker here.
 */
export function UserForm({ onSubmit, isLoading }: UserFormProps) {
  const { isSuperadmin } = useCurrentUser();
  const creatingTier = isSuperadmin ? "admin" : "lead manager";

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
        <Text size="xs" c="dimmed">
          Creates a new {creatingTier} account. The user must change their
          password on first sign-in.
        </Text>
        <Fields isLoading={isLoading} />
        <SubmitButton isLoading={isLoading} />
      </Stack>
    </FormWrapper>
  );
}

function Fields({ isLoading }: { isLoading: boolean }) {
  const { form } = useFormInstance<CreateUserValues>();
  return (
    <>
      <TextInput
        label="Username"
        placeholder="jsmith"
        description="Permanent — cannot be changed after creation."
        required
        disabled={isLoading}
        {...form.getInputProps("username")}
      />
      <TextInput
        label="Display name"
        placeholder="J. Smith"
        required
        disabled={isLoading}
        {...form.getInputProps("display_name")}
      />
      <Group grow align="flex-start">
        <TextInput
          label="Full name (English)"
          disabled={isLoading}
          {...form.getInputProps("full_name_en")}
        />
        <TextInput
          label="Full name (Nepali)"
          disabled={isLoading}
          {...form.getInputProps("full_name_np")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Email"
          type="email"
          placeholder="name@company.com"
          disabled={isLoading}
          {...form.getInputProps("email")}
        />
        <TextInput
          label="Phone"
          disabled={isLoading}
          {...form.getInputProps("phone")}
        />
      </Group>
      <PasswordInput
        label="Temporary password"
        placeholder="Leave blank to auto-generate"
        description="Shown once after creation either way."
        disabled={isLoading}
        {...form.getInputProps("password")}
      />
    </>
  );
}

function SubmitButton({ isLoading }: { isLoading: boolean }) {
  const { handleSubmit, isLoading: submitting } = useFormControls();
  return (
    <Button onClick={handleSubmit} loading={isLoading || submitting} fullWidth>
      Create account
    </Button>
  );
}
