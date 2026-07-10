"use client";

import { Stack } from "@peppermint/ui";
import { MfaCard } from "./MfaCard";
import { PasswordCard } from "./PasswordCard";

export function SecurityTab() {
  return (
    <Stack gap="lg">
      <PasswordCard />
      <MfaCard />
    </Stack>
  );
}
