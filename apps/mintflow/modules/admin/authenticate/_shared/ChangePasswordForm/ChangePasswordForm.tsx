"use client";

import {
  Button,
  PasswordInput,
  Stack,
  notifications,
  useForm,
  useMutation,
} from "@peppermint/ui";
import { getApiError, getApiErrorMessage } from "@/lib/authErrorMessages";
import { changePassword } from "./ChangePasswordForm.api";
import type {
  ChangePasswordFormProps,
  ChangePasswordFormValues,
} from "./ChangePasswordForm.types";

export function ChangePasswordForm({
  onSuccess,
  size = "sm",
}: ChangePasswordFormProps) {
  const form = useForm<ChangePasswordFormValues>({
    initialValues: {
      old_password: "",
      new_password: "",
      confirm_password: "",
    },
    validate: {
      old_password: (value) => (!value ? "Required" : null),
      new_password: (value) =>
        value.length < 12 ? "Must be at least 12 characters" : null,
      confirm_password: (value, values) =>
        value !== values.new_password ? "Passwords do not match" : null,
    },
  });

  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      notifications.show({
        color: "green",
        title: "Password changed",
        message: "Your password has been updated.",
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      const apiError = getApiError(error);
      if (apiError.code === "AUTH_PASSWORD_INVALID") {
        form.setFieldError("old_password", getApiErrorMessage(error));
        return;
      }
      if (apiError.code === "AUTH_PASSWORD_REUSE_BLOCKED") {
        form.setFieldError("new_password", getApiErrorMessage(error));
        return;
      }
      notifications.show({
        color: "red",
        title: "Couldn't change password",
        message: getApiErrorMessage(error),
      });
    },
  });

  return (
    <form
      onSubmit={form.onSubmit((values) =>
        mutation.mutate({
          old_password: values.old_password,
          new_password: values.new_password,
        }),
      )}
    >
      <Stack gap="md">
        <PasswordInput
          label="Current password"
          size={size}
          required
          disabled={mutation.isPending}
          {...form.getInputProps("old_password")}
        />
        <PasswordInput
          label="New password"
          description="At least 12 characters."
          size={size}
          required
          disabled={mutation.isPending}
          {...form.getInputProps("new_password")}
        />
        <PasswordInput
          label="Confirm new password"
          size={size}
          required
          disabled={mutation.isPending}
          {...form.getInputProps("confirm_password")}
        />
        <Button
          type="submit"
          size={size}
          loading={mutation.isPending}
          fullWidth
        >
          Change password
        </Button>
      </Stack>
    </form>
  );
}
