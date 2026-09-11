"use client";

import { Badge, Button, Group, Stack, Text } from "@peppermint/ui";
import { CheckCircle as ActivateIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { Prohibit as RetireIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import { ArrowCounterClockwise as RestoreIcon } from "@phosphor-icons/react/dist/csr/ArrowCounterClockwise";
import { useChangeSignatoryStatus } from "../../../signatures.hooks";
import {
  SIGNATORY_STATUS_COLORS,
  SIGNATORY_STATUS_HINTS,
  SIGNATORY_STATUS_LABELS,
} from "../../../signatures.labels";
import type { Signatory } from "../../../signatures.types";

/**
 * Status, what it means, and the button that changes it — **on the edit screen,
 * not only in the list row**.
 *
 * This is the last step of "add a signer" and it is not optional: every record
 * is created `draft`, and the certificate picker lists only `active`
 * signatories. Leaving activation to a small icon back on the list meant a user
 * could create a signatory, upload its image, return to the certificate, and
 * find nothing selectable — with no indication of why.
 *
 * Every transition is allowed in any order (§5), so a draft and a retired signer
 * are both one click from active.
 */
export function SignatoryStatusBar({ signatory }: { signatory: Signatory }) {
  const mutation = useChangeSignatoryStatus(signatory.id);
  const isActive = signatory.is_active;

  const nextStatus = isActive ? "inactive" : "active";
  const label = isActive
    ? "Retire"
    : signatory.status === "inactive"
      ? "Reinstate"
      : "Activate";
  const Glyph = isActive
    ? RetireIcon
    : signatory.status === "inactive"
      ? RestoreIcon
      : ActivateIcon;

  return (
    <Group
      justify="space-between"
      align="flex-start"
      wrap="nowrap"
      gap="sm"
      p="xs"
      style={{
        border: "1px solid var(--mantine-color-gray-light)",
        borderRadius: "var(--mantine-radius-sm)",
      }}
    >
      <Stack gap={4} style={{ minWidth: 0 }}>
        <Badge
          size="sm"
          variant="light"
          color={SIGNATORY_STATUS_COLORS[signatory.status]}
          w="fit-content"
        >
          {SIGNATORY_STATUS_LABELS[signatory.status]}
        </Badge>
        <Text size="xs" c="dimmed">
          {SIGNATORY_STATUS_HINTS[signatory.status]}
        </Text>
      </Stack>
      <Button
        size="xs"
        variant={isActive ? "subtle" : "filled"}
        color={isActive ? "orange" : "green"}
        loading={mutation.isPending}
        leftSection={<Glyph size={14} aria-hidden />}
        onClick={() => mutation.mutate({ status: nextStatus })}
        style={{ flexShrink: 0 }}
      >
        {label}
      </Button>
    </Group>
  );
}
