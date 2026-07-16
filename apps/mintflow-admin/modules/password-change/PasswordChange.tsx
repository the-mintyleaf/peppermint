"use client";

import { Center, Paper, Stack, Text, Title } from "@peppermint/ui";
import { ChangePasswordForm } from "@/modules/admin/authenticate/_shared/ChangePasswordForm";

export function ModulePasswordChange() {
  const handleSuccess = () => {
    window.location.href = "/admin";
  };

  return (
    <Center mih="100vh" p="md">
      <Paper withBorder p="xl" radius="md" maw={400} w="100%">
        <Stack gap="lg">
          <Stack gap={4}>
            <Title order={2}>Update your password</Title>
            <Text size="sm" c="dimmed">
              You need to set a new password before continuing.
            </Text>
          </Stack>

          <ChangePasswordForm onSuccess={handleSuccess} />
        </Stack>
      </Paper>
    </Center>
  );
}
