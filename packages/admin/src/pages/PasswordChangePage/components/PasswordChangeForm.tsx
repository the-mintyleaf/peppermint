"use client";

import { KeyIcon, LockKeyIcon } from "@phosphor-icons/react/dist/ssr";

import { Button, PasswordInput, Stack } from "@peppermint/ui";

import { PasswordStrengthMeter } from "./PasswordStrengthMeter";
import type { PasswordChangeFormProps } from "./PasswordChangeForm.types";

/**
 * The three password fields, in the order the task is actually performed:
 * prove who you are, choose the new secret, confirm you typed it as intended.
 * The meter sits directly under the new-password field so the guidance is read
 * while that field is still in focus, not after the user has moved past it.
 */
export function PasswordChangeForm({ controller }: PasswordChangeFormProps) {
  const { form, isLoading, minPasswordLength, onSubmit } = controller;

  return (
    <form onSubmit={onSubmit} noValidate>
      <Stack gap="md">
        <PasswordInput
          size="md"
          label="Current password"
          placeholder="Your existing password"
          autoComplete="current-password"
          required
          disabled={isLoading}
          leftSection={
            <KeyIcon size={16} weight="fill" style={{ opacity: 0.5 }} />
          }
          {...form.getInputProps("old_password")}
        />

        <Stack gap="xs">
          <PasswordInput
            size="md"
            label="New password"
            placeholder={`At least ${minPasswordLength} characters`}
            autoComplete="new-password"
            required
            disabled={isLoading}
            leftSection={
              <LockKeyIcon size={16} weight="fill" style={{ opacity: 0.5 }} />
            }
            {...form.getInputProps("new_password")}
          />

          <PasswordStrengthMeter
            password={form.values.new_password}
            minLength={minPasswordLength}
          />
        </Stack>

        <PasswordInput
          size="md"
          label="Confirm new password"
          placeholder="Re-enter your new password"
          autoComplete="new-password"
          required
          disabled={isLoading}
          leftSection={
            <LockKeyIcon size={16} weight="fill" style={{ opacity: 0.5 }} />
          }
          {...form.getInputProps("confirm_password")}
        />

        <Button
          type="submit"
          size="md"
          color="brand"
          fullWidth
          mt="xs"
          loading={isLoading}
        >
          Update password
        </Button>
      </Stack>
    </form>
  );
}
