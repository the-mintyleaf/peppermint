"use client";

import { GearSixIcon } from "@phosphor-icons/react/dist/csr/GearSix";
import { Center, Stack, Text } from "@peppermint/ui";

import { Screen } from "@/components";
import { SectionLabel } from "@/components";

/**
 * Settings placeholder — the icon rail exposes a Settings destination; the full
 * surface is out of scope for the current build.
 */
export function ModuleSettings() {
  return (
    <Screen>
      <SectionLabel>SETTINGS</SectionLabel>
      <Center mih="50vh">
        <Stack align="center" gap={10}>
          <GearSixIcon size={40} color="rgba(0,0,0,0.25)" />
          <Text fw={600} c="rgba(0,0,0,0.5)">
            Settings are coming soon.
          </Text>
          <Text fz="sm" c="dimmed" ta="center" maw={260}>
            Preferences you set during onboarding will be editable here.
          </Text>
        </Stack>
      </Center>
    </Screen>
  );
}
