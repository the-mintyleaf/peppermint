"use client";

import { Button, Stack, Text, TextInput } from "@peppermint/ui";

interface MagicLinkFormProps {
  email: string;
  onEmailChange: (email: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

/** Email-only alternative to the credentials form, mailing a one-time sign-in link. */
export function MagicLinkForm({
  email,
  onEmailChange,
  onSubmit,
  onCancel,
}: MagicLinkFormProps) {
  return (
    <Stack gap="md">
      <Stack gap={0} mb="xs">
        <Text fw={600} size="lg" ta="center">
          Magic Link
        </Text>
        <Text c="dimmed" size="sm" ta="center">
          We&apos;ll email you a link to sign in instantly.
        </Text>
      </Stack>

      <TextInput
        size="md"
        label="Email"
        placeholder="name@example.com"
        type="email"
        required
        value={email}
        onChange={(e) => onEmailChange(e.currentTarget.value)}
      />

      <Button
        size="md"
        color="black"
        onClick={onSubmit}
        disabled={!email.trim()}
        fullWidth
        h={50}
      >
        Send Magic Link
      </Button>

      <Button
        variant="subtle"
        size="sm"
        c="dimmed"
        onClick={onCancel}
        fullWidth
      >
        Back to Sign In
      </Button>
    </Stack>
  );
}
