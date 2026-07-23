"use client";

import { Center, Paper, Stack, Text, Title } from "@peppermint/ui";
import { RequireAuth } from "@/components/RequireAuth";
import { ChangeOwnPasswordForm } from "@/modules/admin/authenticate/_shared/password";
import { clearAuthTokens } from "@/lib/authTokens";

function goToSignIn() {
  clearAuthTokens();
  if (typeof window !== "undefined") window.location.href = "/";
}

/**
 * Forced first-login password change. The account already holds a valid access token
 * from `login` (`must_change_password: true` doesn't withhold the session) — this
 * screen just calls the same `password/change/` endpoint every voluntary change uses
 * (`authenticate/docs/INTEGRATION.md` §7, §8 "First login after provisioning").
 * Styled to match mintway's `modules/password-change` card treatment.
 */
export function ModulePasswordChange() {
  return (
    <RequireAuth>
      <Center mih="100vh" p="md">
        <Paper withBorder p="xl" radius="md" maw={420} w="100%">
          <Stack gap="lg">
            <Stack gap={4}>
              <Title order={2}>Set a new password</Title>
              <Text size="sm" c="dimmed">
                You&apos;re signing in with a temporary password. Choose a new
                one to continue.
              </Text>
            </Stack>
            <ChangeOwnPasswordForm onSuccess={goToSignIn} />
          </Stack>
        </Paper>
      </Center>
    </RequireAuth>
  );
}
