"use client";

import { useRouter } from "next/navigation";
import { Center, Paper, Stack, Text, Title } from "@peppermint/ui";
import { RequireAuth } from "@/components/RequireAuth";
import { MfaEnrollPanel } from "@/modules/admin/authenticate/_shared/mfa";

/**
 * Forced superadmin MFA enrollment — reached when `login` returns
 * `mfa_enrollment_required: true` (`authenticate/docs/INTEGRATION.md` §8, "Superadmin
 * mandatory MFA"). The account already holds a valid access token; enrollment doesn't
 * revoke the current session (`mfa/verify` is the one MFA endpoint that doesn't).
 * Same forced-step card treatment as `modules/password-change`.
 */
export function ModuleMfaEnrollForced() {
  const router = useRouter();

  return (
    <RequireAuth>
      <Center mih="100vh" p="md">
        <Paper withBorder p="xl" radius="md" maw={420} w="100%">
          <Stack gap="lg">
            <Stack gap={4}>
              <Title order={2}>Set up your authenticator</Title>
              <Text size="sm" c="dimmed">
                Superadmin accounts require an authenticator app before you can
                continue.
              </Text>
            </Stack>
            <MfaEnrollPanel onVerified={() => router.push("/admin")} />
          </Stack>
        </Paper>
      </Center>
    </RequireAuth>
  );
}
