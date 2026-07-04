"use client";

import { Card, Group, Stack, Text, Title } from "@peppermint/ui";
import { PasswordIcon } from "@phosphor-icons/react/dist/csr/Password";
import { ChangePasswordForm } from "@/modules/admin/authenticate/_shared/ChangePasswordForm";

export function PasswordCard() {
  return (
    <Card withBorder radius="md" p="lg">
      <Stack gap="md">
        <Group gap="xs">
          <PasswordIcon size={20} aria-hidden />
          <Title order={4}>Password</Title>
        </Group>
        <Text size="sm" c="dimmed">
          Choose a strong password you don&apos;t use anywhere else.
        </Text>
        <ChangePasswordForm />
      </Stack>
    </Card>
  );
}
