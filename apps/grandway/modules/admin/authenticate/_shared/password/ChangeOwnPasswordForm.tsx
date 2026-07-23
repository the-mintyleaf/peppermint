"use client";

import {
  Alert,
  Button,
  PasswordInput,
  Stack,
  Text,
  notifications,
  useMutation,
} from "@peppermint/ui";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import {
  FormWrapper,
  useFormInstance,
  useFormControls,
} from "@peppermint/admin";
import { z } from "zod";
import { changeOwnPassword } from "./password.api";
import { newPasswordSchema } from "./passwordPolicy";
import { resolvePasswordError } from "./passwordErrors";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";
import type {
  ChangeOwnPasswordFormProps,
  ChangeOwnPasswordFormValues,
} from "./ChangeOwnPasswordForm.types";

const schema = z
  .object({
    current_password: z.string().min(1, "Required"),
    new_password: newPasswordSchema,
    new_password_confirm: z.string().min(1, "Required"),
  })
  .refine((v) => v.new_password === v.new_password_confirm, {
    path: ["new_password_confirm"],
    message: "Passwords do not match",
  });

/**
 * Change the signed-in user's own password. Uses `FormWrapper` for state/validation and
 * a custom submit so Grandway field errors (wrong current password, weak new password)
 * land on the right input. On success the backend revokes every session
 * (`authenticate/docs/INTEGRATION.md` §7).
 */
export function ChangeOwnPasswordForm({
  onSuccess,
  size = "sm",
}: ChangeOwnPasswordFormProps) {
  return (
    <FormWrapper<ChangeOwnPasswordFormValues>
      initial={{
        current_password: "",
        new_password: "",
        new_password_confirm: "",
      }}
      validation={[schema]}
    >
      <Stack gap="md">
        <Alert color="yellow" variant="light" icon={<WarningIcon size={16} />}>
          <Text size="xs">
            Changing your password signs you out of every device. You&apos;ll
            need to sign in again with the new password.
          </Text>
        </Alert>
        <Fields size={size} />
        <SubmitButton size={size} onSuccess={onSuccess} />
      </Stack>
    </FormWrapper>
  );
}

function Fields({ size }: { size: ChangeOwnPasswordFormProps["size"] }) {
  const { form } = useFormInstance<ChangeOwnPasswordFormValues>();
  return (
    <>
      <PasswordInput
        label="Current password"
        size={size}
        required
        {...form.getInputProps("current_password")}
      />
      <PasswordInput
        label="New password"
        size={size}
        required
        {...form.getInputProps("new_password")}
      />
      <PasswordStrengthMeter password={form.values.new_password} />
      <PasswordInput
        label="Confirm new password"
        size={size}
        required
        {...form.getInputProps("new_password_confirm")}
      />
    </>
  );
}

function SubmitButton({
  size,
  onSuccess,
}: {
  size: ChangeOwnPasswordFormProps["size"];
  onSuccess?: () => void;
}) {
  const { form } = useFormInstance<ChangeOwnPasswordFormValues>();
  const { isLoading } = useFormControls();

  const mutation = useMutation({
    mutationFn: changeOwnPassword,
    onSuccess: () => {
      notifications.show({
        color: "green",
        title: "Password changed",
        message: "Your password has been updated. Please sign in again.",
      });
      onSuccess?.();
    },
    onError: (error) => {
      const resolved = resolvePasswordError(error);
      if (resolved.field) {
        form.setFieldError(resolved.field, resolved.message);
        return;
      }
      notifications.show({
        color: "red",
        title: "Couldn't change password",
        message: resolved.message,
      });
    },
  });

  const handleSubmit = () => {
    const { hasErrors } = form.validate();
    if (hasErrors) return;
    mutation.mutate({
      current_password: form.values.current_password,
      new_password: form.values.new_password,
    });
  };

  return (
    <Button
      size={size}
      loading={mutation.isPending || isLoading}
      onClick={handleSubmit}
      fullWidth
    >
      Change password
    </Button>
  );
}
