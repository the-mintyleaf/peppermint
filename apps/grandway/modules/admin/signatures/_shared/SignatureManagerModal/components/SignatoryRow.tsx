"use client";

import {
  ActionIcon,
  Badge,
  Box,
  Group,
  Stack,
  Text,
  Tooltip,
} from "@peppermint/ui";
import { PencilSimple as EditIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { ArrowCounterClockwise as RestoreIcon } from "@phosphor-icons/react/dist/csr/ArrowCounterClockwise";
import { CheckCircle as ActivateIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { Prohibit as RetireIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import { SignatureImage } from "../../SignatureImage";
import { useChangeSignatoryStatus } from "../../../signatures.hooks";
import {
  SIGNATORY_STATUS_COLORS,
  SIGNATORY_STATUS_LABELS,
  SIGNATURE_SOURCE_LABELS,
} from "../../../signatures.labels";
import type { Signatory } from "../../../signatures.types";

interface SignatoryRowProps {
  signatory: Signatory;
  onEdit: (id: string) => void;
}

/**
 * One row of the library. The signature thumbnail is shown rather than a
 * filename because the thing an operator is checking is what will print, and a
 * filename does not answer that.
 *
 * The status control is a single icon whose meaning depends on the current
 * status, since every transition is allowed in any order (§5) — a `draft` and a
 * retired signer are both one click from active.
 */
export function SignatoryRow({ signatory, onEdit }: SignatoryRowProps) {
  const statusMutation = useChangeSignatoryStatus(signatory.id);

  const isActive = signatory.is_active;
  const nextStatus = isActive ? "inactive" : "active";
  const actionLabel = isActive
    ? "Retire signatory"
    : signatory.status === "inactive"
      ? "Reinstate signatory"
      : "Activate signatory";
  const ActionGlyph = isActive
    ? RetireIcon
    : signatory.status === "inactive"
      ? RestoreIcon
      : ActivateIcon;

  return (
    <Group
      gap="sm"
      wrap="nowrap"
      align="center"
      py="xs"
      style={{ borderBottom: "1px solid var(--mantine-color-gray-light)" }}
    >
      <Box w={96} style={{ flexShrink: 0 }}>
        <SignatureImage signatory={signatory} height={40} emptyLabel={null} />
      </Box>

      <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
        <Group gap={6} wrap="nowrap">
          <Text size="sm" fw={500} truncate>
            {signatory.name}
          </Text>
          <Badge
            size="xs"
            variant="light"
            color={SIGNATORY_STATUS_COLORS[signatory.status]}
          >
            {SIGNATORY_STATUS_LABELS[signatory.status]}
          </Badge>
        </Group>
        <Text size="xs" c="dimmed" truncate>
          {[signatory.title, signatory.role].filter(Boolean).join(" · ") ||
            "No title or role"}
          {" — "}
          {SIGNATURE_SOURCE_LABELS[signatory.signature_source]}
        </Text>
      </Stack>

      <Group gap={4} wrap="nowrap">
        <Tooltip label="Edit details and signature" withArrow>
          <ActionIcon
            variant="subtle"
            size="sm"
            onClick={() => onEdit(signatory.id)}
            aria-label={`Edit ${signatory.name}`}
          >
            <EditIcon size={14} aria-hidden />
          </ActionIcon>
        </Tooltip>
        <Tooltip label={actionLabel} withArrow>
          <ActionIcon
            variant="subtle"
            size="sm"
            color={isActive ? "orange" : "green"}
            loading={statusMutation.isPending}
            onClick={() => statusMutation.mutate({ status: nextStatus })}
            aria-label={`${actionLabel}: ${signatory.name}`}
          >
            <ActionGlyph size={14} aria-hidden />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Group>
  );
}
