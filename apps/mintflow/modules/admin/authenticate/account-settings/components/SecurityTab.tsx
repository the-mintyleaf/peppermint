"use client";

import { useState } from "react";
import { Button, Divider, Stack } from "@peppermint/ui";
import { ChangePasswordForm } from "@/modules/admin/authenticate/_shared/ChangePasswordForm";
import type { SettingsTabProps } from "../account-settings.types";
import { MfaSection } from "./MfaSection";
import { useMfaSection } from "./MfaSection.hooks";
import { SettingsHeader } from "./SettingsHeader";
import { SettingsRow } from "./SettingsRow";
import { SettingsSubScreen } from "./SettingsSubScreen";

export function SecurityTab({ title, description }: SettingsTabProps) {
  const [view, setView] = useState<"overview" | "password">("overview");
  const mfa = useMfaSection();

  // MFA setup/confirm takes over the whole content pane as its own sub-screen.
  if (mfa.screen !== "idle") {
    return <MfaSection mfa={mfa} />;
  }

  if (view === "password") {
    return (
      <SettingsSubScreen
        title="Change password"
        onBack={() => setView("overview")}
      >
        <Stack maw={420}>
          <ChangePasswordForm size="xs" onSuccess={() => setView("overview")} />
        </Stack>
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
      <Divider />
      <MfaSection mfa={mfa} />
    </Stack>
  );
}
