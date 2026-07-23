"use client";

import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  PasswordInput,
  PinInput,
  Stack,
  Text,
  notifications,
  useMutation,
  useQueryClient,
} from "@peppermint/ui";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import { ChangeOwnPasswordForm } from "@/modules/admin/authenticate/_shared/password";
import {
  MfaEnrollPanel,
  disableMfa,
} from "@/modules/admin/authenticate/_shared/mfa";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import { clearAuthTokens } from "@/lib/authTokens";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import type { SettingsTabProps } from "../account-settings.types";
import { SettingsHeader } from "./SettingsHeader";
import { SettingsRow } from "./SettingsRow";
import { SettingsSubScreen } from "./SettingsSubScreen";

type View = "overview" | "password" | "mfa-enroll" | "mfa-disable";

function goToSignIn() {
  clearAuthTokens();
  if (typeof window !== "undefined") window.location.href = "/";
}

/**
 * Password + MFA management for the signed-in account
 * (`authenticate/docs/INTEGRATION.md` §7). Changing the password or disabling MFA both
 * revoke every session, so both success paths drop the token and return to sign-in.
 * Superadmin MFA is mandatory (`AUTH_MFA_MANDATORY`) — the disable action is hidden for
 * that authority rather than left to fail.
 */
export function SecurityTab({ title, description }: SettingsTabProps) {
  const [view, setView] = useState<View>("overview");
  const { user, isSuperadmin, refetch } = useCurrentUser();

  if (view === "password") {
    return (
      <SettingsSubScreen
        title="Change password"
        onBack={() => setView("overview")}
      >
        <Stack maw={360} w="100%" mx="auto" mt="lg">
          <ChangeOwnPasswordForm size="xs" onSuccess={goToSignIn} />
        </Stack>
      </SettingsSubScreen>
    );
  }

  if (view === "mfa-enroll") {
    return (
      <SettingsSubScreen
        title="Set up authenticator"
        onBack={() => setView("overview")}
      >
        <MfaEnrollPanel
          onVerified={() => {
            refetch();
            setView("overview");
          }}
        />
      </SettingsSubScreen>
    );
  }

  if (view === "mfa-disable") {
    return (
      <SettingsSubScreen
        title="Turn off authenticator"
        onBack={() => setView("overview")}
      >
        <DisableMfaForm onDisabled={goToSignIn} />
      </SettingsSubScreen>
    );
  }

  return (
    <Stack gap="md">
      <SettingsHeader title={title} description={description} />
      <SettingsRow
        label="Password"
        description="Choose a strong password you don't use anywhere else."
        right={
          <Button
            size="xs"
            variant="default"
            onClick={() => setView("password")}
          >
            Change password
          </Button>
        }
      />
      <SettingsRow
        label="Authenticator app"
        description={
          isSuperadmin
            ? "Required for superadmin accounts and can't be turned off."
            : "Adds a 6-digit code requirement to every sign-in."
        }
        right={
          user?.mfa_enabled ? (
            <Stack gap={4} align="flex-end">
              <Badge size="xs" color="teal" variant="light">
                Enabled
              </Badge>
              {!isSuperadmin ? (
                <Button
                  size="xs"
                  variant="subtle"
                  color="red"
                  onClick={() => setView("mfa-disable")}
                >
                  Turn off
                </Button>
              ) : null}
            </Stack>
          ) : (
            <Button
              size="xs"
              variant="default"
              onClick={() => setView("mfa-enroll")}
            >
              Set up
            </Button>
          )
        }
      />
    </Stack>
  );
}

function DisableMfaForm({ onDisabled }: { onDisabled: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [code, setCode] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => disableMfa(currentPassword, code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      notifications.show({
        color: "green",
        title: "Authenticator turned off",
        message: "Please sign in again.",
      });
      onDisabled();
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Couldn't turn off the authenticator",
        message: getApiErrorMessage(error),
      });
    },
  });

  return (
    <Stack gap="md" maw={320}>
      <Alert color="yellow" variant="light" icon={<WarningIcon size={16} />}>
        <Text size="xs">
          This signs you out of every device. You&apos;ll need to sign in again.
        </Text>
      </Alert>
      <PasswordInput
        label="Current password"
        size="xs"
        required
        value={currentPassword}
        onChange={(event) => setCurrentPassword(event.currentTarget.value)}
      />
      <Stack gap={4}>
        <Text size="xs" fw={500}>
          Authenticator code
        </Text>
        <PinInput
          length={6}
          type="number"
          size="xs"
          aria-label="Authenticator code"
          value={code}
          onChange={setCode}
        />
      </Stack>
      <Button
        size="xs"
        color="red"
        loading={mutation.isPending}
        disabled={!currentPassword || code.length !== 6}
        onClick={() => mutation.mutate()}
      >
        Turn off authenticator
      </Button>
    </Stack>
  );
}
