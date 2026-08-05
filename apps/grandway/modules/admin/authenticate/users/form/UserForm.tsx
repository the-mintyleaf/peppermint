"use client";

import {
  Alert,
  Button,
  Group,
  PasswordInput,
  Stack,
  TextInput,
} from "@peppermint/ui";
import {
  FormWrapper,
  useFormControls,
  useFormInstance,
} from "@peppermint/admin";
import { LockKeyIcon } from "@phosphor-icons/react/dist/csr/LockKey";
import { z } from "zod";
import { useManagedTier } from "@/config/access";
import { AUTHORITY_LABELS } from "@/modules/admin/authenticate/_shared/authenticate.labels";
import type { AuthorityType } from "@/modules/admin/authenticate/_shared/authenticate.types";
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
 * `authenticate/docs/INTEGRATION.md` §7).
 *
 * `authority_type` is **not a field**. It is fixed to the one tier the caller manages
 * (`useManagedTier` — superadmin creates admins, an admin creates lead managers), and
 * the backend 403s `AUTH_INVALID_AUTHORITY` on anything else. So the role is stated
 * as a fact, never offered as a control: a disabled single-option `Select` reads as a
 * broken input, and a `Radio` group implies a choice that does not exist.
 *
 * It is stated once per moment the admin needs it — the modal title (what screen am I
 * on), the notice below (what am I about to make, and why can't I change it), and the
 * submit label (what happens when I click).
 */
export function UserForm({ onSubmit, isLoading }: UserFormProps) {
  const managedTier = useManagedTier();

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
        <RoleNotice managedTier={managedTier} />
        <Fields isLoading={isLoading} />
        <SubmitButton isLoading={isLoading} managedTier={managedTier} />
      </Stack>
    </FormWrapper>
  );
}

/**
 * The forced role, as a fact rather than a control — it sits above the fields, framed
 * and icon-marked, so it never reads as something to fill in (`DESIGN.md`: state and
 * action must look and sit differently).
 */
function RoleNotice({ managedTier }: { managedTier: AuthorityType | null }) {
  if (!managedTier) {
    return (
      <Alert
        color="red"
        variant="light"
        icon={<LockKeyIcon size={16} weight="fill" aria-hidden />}
        title="Your role can't create accounts"
      >
        Account creation is limited to admins and superadmins.
      </Alert>
    );
  }

  return (
    <Alert
      color="blue"
      variant="light"
      icon={<LockKeyIcon size={16} weight="fill" aria-hidden />}
      title={`This creates a ${AUTHORITY_LABELS[managedTier]} account`}
    >
      The role is fixed by your own — you can only create{" "}
      {AUTHORITY_LABELS[managedTier]} accounts, and it can&apos;t be changed
      afterwards.
    </Alert>
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
        description="Shown once after creation either way. They must change it on first sign-in."
        disabled={isLoading}
        {...form.getInputProps("password")}
      />
    </>
  );
}

function SubmitButton({
  isLoading,
  managedTier,
}: {
  isLoading: boolean;
  managedTier: AuthorityType | null;
}) {
  const { handleSubmit, isLoading: submitting } = useFormControls();
  return (
    <Button
      onClick={handleSubmit}
      loading={isLoading || submitting}
      disabled={!managedTier}
      fullWidth
    >
      {managedTier
        ? `Create ${AUTHORITY_LABELS[managedTier]} account`
        : "Create account"}
    </Button>
  );
}
