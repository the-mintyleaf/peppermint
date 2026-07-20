"use client";

import { CheckIcon, XIcon } from "@phosphor-icons/react/dist/ssr";

import { Group, Progress, Stack, Text, VisuallyHidden } from "@peppermint/ui";

import {
  getPasswordStrength,
  getPasswordStrengthMeta,
  passwordRequirements,
} from "../utils/passwordStrength";
import type {
  PasswordRequirementItemProps,
  PasswordStrengthMeterProps,
} from "./PasswordStrengthMeter.types";

function RequirementItem({ met, label }: PasswordRequirementItemProps) {
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

/**
 * Scores the new password against the requirement checklist. Only the length
 * rule gates submission — the rest are guidance, which is why an unmet item
 * reads as dimmed rather than as an error.
 */
export function PasswordStrengthMeter({
  password,
  minLength,
}: PasswordStrengthMeterProps) {
  const strength = getPasswordStrength(password, minLength);
  const meta = getPasswordStrengthMeta(strength);

  return (
    <Stack gap="xs">
      <Group gap="sm" wrap="nowrap" align="center">
        {/*
         * Presentational on purpose. Mantine's `Progress` consumes `aria-label`
         * and renders its own `role="progressbar"` on the inner section, so
         * adding ARIA here would nest a second, unnamed progressbar reporting a
         * percentage that contradicts the label beside it. The strength is
         * conveyed by that label, and the checklist below states every rule
         * individually — so nothing is lost by hiding the bar itself.
         */}
        <Progress
          value={strength}
          color={meta.color}
          size="sm"
          radius="xl"
          style={{ flex: 1 }}
          aria-hidden
        />
        <Text size="xs" fw={600} w={48} ta="right">
          <VisuallyHidden>
            Password strength: {meta.label || "none yet"}.
          </VisuallyHidden>
          <span aria-hidden>{meta.label}</span>
        </Text>
      </Group>

      <Stack gap={4}>
        {passwordRequirements(minLength).map((req) => (
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
