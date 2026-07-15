"use client";

import { useState } from "react";
import { Button, Stack } from "@peppermint/ui";
import { ChangeOwnPasswordForm } from "@/modules/admin/authenticate/_shared/password";
import type { SettingsTabProps } from "../account-settings.types";
import { SettingsHeader } from "./SettingsHeader";
import { SettingsRow } from "./SettingsRow";
import { SettingsSubScreen } from "./SettingsSubScreen";

/**
 * Password management for the signed-in user. Changing the password revokes every
 * session, so on success we drop the access token and return to sign-in.
 */
export function SecurityTab({ title, description }: SettingsTabProps) {
  const [view, setView] = useState<"overview" | "password">("overview");

  const handleChanged = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      window.location.href = "/";
    }
  };

  if (view === "password") {
    return (
      <SettingsSubScreen
        title="Change password"
        onBack={() => setView("overview")}
      >
        <Stack maw={360} w="100%" mx="auto" mt="lg">
          <ChangeOwnPasswordForm size="xs" onSuccess={handleChanged} />
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
    </Stack>
  );
}
