"use client";

import { Group, Progress, Stack, Text, VisuallyHidden } from "@peppermint/ui";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import {
  PASSWORD_REQUIREMENTS,
  getPasswordStrength,
  getPasswordStrengthMeta,
} from "./passwordPolicy";
import type { PasswordStrengthMeterProps } from "./PasswordStrengthMeter.types";

function RequirementItem({ met, label }: { met: boolean; label: string }) {
  return (
    <Group gap={6} wrap="nowrap" align="center">
      {met ? (
        <CheckIcon
          size={14}
          color="var(--mantine-color-teal-6)"
          weight="bold"
          aria-hidden
        />
      ) : (
        <XIcon size={14} color="var(--mantine-color-dimmed)" aria-hidden />
      )}
      <Text size="xs" c={met ? undefined : "dimmed"}>
        <VisuallyHidden>{met ? "Met: " : "Not met: "}</VisuallyHidden>
        {label}
      </Text>
    </Group>
  );
}

export function PasswordStrengthMeter({
  password,
}: PasswordStrengthMeterProps) {
  const strength = getPasswordStrength(password);
  const meta = getPasswordStrengthMeta(strength);

  return (
    <Stack gap="xs">
      <Group gap="sm" wrap="nowrap" align="center">
        <Progress
          value={strength}
          color={meta.color}
          size="sm"
          radius="xl"
          style={{ flex: 1 }}
          role="progressbar"
          aria-label="Password strength"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={strength}
          aria-valuetext={meta.label || "Empty"}
        />
        <Text size="xs" fw={600} w={48} ta="right">
          {meta.label}
        </Text>
      </Group>
      <Stack gap={4}>
        {PASSWORD_REQUIREMENTS.map((req) => (
          <RequirementItem
            key={req.label}
            label={req.label}
            met={req.test(password)}
          />
        ))}
      </Stack>
    </Stack>
  );
}
