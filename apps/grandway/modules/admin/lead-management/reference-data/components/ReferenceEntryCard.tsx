"use client";

import {
  ActionIcon,
  Badge,
  Card,
  Group,
  Stack,
  Text,
  Tooltip,
  modals,
} from "@peppermint/ui";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowCounterClockwise";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import { referenceEntryLabel } from "../../referenceEntry.utils";
import type { ReferenceEntryCardProps } from "./ReferenceEntryCard.types";

export function ReferenceEntryCard({
  entry,
  onEdit,
  onSetActive,
  isSettingActive,
  activeToggleDisabled,
}: ReferenceEntryCardProps) {
  // An entry saved before the frontend matched the English-only contract has
  // no stored name at all (see `referenceEntryLabel`). It still shows and is
  // still selectable — but it is called out here, the one screen that can fix
  // it, rather than left looking like an entry whose name happens to be short.
  const unnamed = entry.name.trim() === "";
  const label = referenceEntryLabel(entry);

  const handleRetire = () => {
    modals.openConfirmModal({
      title: "Retire this entry?",
      children:
        "It stops showing up as a new pick. Leads already using it keep their reference — nothing changes for them, and you can reactivate this at any time.",
      labels: { confirm: "Retire", cancel: "Keep active" },
      confirmProps: { color: "red" },
      styles: { inner: { padding: "var(--mantine-spacing-md)" } },
      onConfirm: () => onSetActive(false),
    });
  };

  return (
    <Card withBorder padding="sm" radius="md">
      <Group justify="space-between" wrap="nowrap" align="flex-start">
        <Stack gap={4}>
          <Text fw={600} size="sm" c={unnamed ? "dimmed" : undefined}>
            {label}
          </Text>
          <Group gap={6} wrap="wrap">
            <Badge size="xs" variant="light" color="gray">
              {entry.code}
            </Badge>
            <Badge
              size="xs"
              variant="light"
              color={entry.is_active ? "green" : "gray"}
            >
              {entry.is_active ? "Active" : "Retired"}
            </Badge>
            {entry.requires_detail ? (
              <Badge size="xs" variant="light" color="blue">
                Needs explanation
              </Badge>
            ) : null}
            {unnamed ? (
              <Badge size="xs" variant="light" color="orange">
                Needs a name
              </Badge>
            ) : null}
          </Group>
        </Stack>

        <Group gap={4} wrap="nowrap">
          <Tooltip label="Edit">
            <ActionIcon
              variant="subtle"
              size="sm"
              aria-label={`Edit ${label}`}
              onClick={onEdit}
              disabled={activeToggleDisabled}
            >
              <PencilSimpleIcon size={14} aria-hidden />
            </ActionIcon>
          </Tooltip>
          {entry.is_active ? (
            <Tooltip label="Retire">
              <ActionIcon
                variant="subtle"
                color="red"
                size="sm"
                aria-label={`Retire ${label}`}
                onClick={handleRetire}
                loading={isSettingActive}
                disabled={activeToggleDisabled}
              >
                <ProhibitIcon size={14} aria-hidden />
              </ActionIcon>
            </Tooltip>
          ) : (
            <Tooltip label="Reactivate">
              <ActionIcon
                variant="subtle"
                size="sm"
                aria-label={`Reactivate ${label}`}
                onClick={() => onSetActive(true)}
                loading={isSettingActive}
                disabled={activeToggleDisabled}
              >
                <ArrowCounterClockwiseIcon size={14} aria-hidden />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      </Group>
    </Card>
  );
}
