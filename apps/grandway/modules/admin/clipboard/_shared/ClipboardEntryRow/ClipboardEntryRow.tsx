"use client";

import { useState } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  Tooltip,
} from "@peppermint/ui";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { CopyIcon } from "@phosphor-icons/react/dist/csr/Copy";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { fieldKeyLabel } from "../../clipboard.fieldKeys";
import type { ClipboardEntryRowProps } from "./ClipboardEntryRow.types";

const COPIED_FLASH_MS = 1500;

/**
 * One saved snippet. The primary lever is **Copy** (a labelled button — it is the
 * reason the entry exists); edit and delete are quiet icon buttons, and delete sits
 * last, away from Copy, so a miss-click never destroys a snippet. Delete is
 * irreversible (no restore), so the row only ASKS — the drawer owns the confirmation.
 */
export function ClipboardEntryRow({
  entry,
  onCopy,
  onEdit,
  onDelete,
  isDeleting = false,
}: ClipboardEntryRowProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await onCopy(entry);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), COPIED_FLASH_MS);
  };

  return (
    <Paper withBorder radius="md" p="sm">
      <Stack gap={6}>
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Stack gap={4} miw={0} style={{ flex: 1 }}>
            <Text fw={600} size="sm" truncate>
              {entry.label}
            </Text>
            {entry.category || entry.field_key ? (
              <Group gap={6}>
                {entry.category ? (
                  <Badge size="xs" variant="light" color="gray">
                    {entry.category.name}
                  </Badge>
                ) : null}
                {entry.field_key ? (
                  <Badge size="xs" variant="outline" color="blue">
                    {fieldKeyLabel(entry.field_key)}
                  </Badge>
                ) : null}
              </Group>
            ) : null}
          </Stack>
          <Group gap={4} wrap="nowrap">
            <Button
              size="compact-sm"
              variant={copied ? "light" : "default"}
              color={copied ? "green" : undefined}
              leftSection={
                copied ? (
                  <CheckIcon size={14} aria-hidden />
                ) : (
                  <CopyIcon size={14} aria-hidden />
                )
              }
              onClick={handleCopy}
              disabled={isDeleting}
              aria-label={`Copy ${entry.label}`}
            >
              {copied ? "Copied" : "Copy"}
            </Button>
            <Tooltip label="Edit">
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={() => onEdit(entry)}
                disabled={isDeleting}
                aria-label={`Edit ${entry.label}`}
              >
                <PencilSimpleIcon size={16} aria-hidden />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Delete">
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={() => onDelete(entry)}
                loading={isDeleting}
                aria-label={`Delete ${entry.label}`}
              >
                <TrashIcon size={16} aria-hidden />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
        <Text
          size="sm"
          c="dimmed"
          lineClamp={2}
          style={{ whiteSpace: "pre-line", overflowWrap: "anywhere" }}
        >
          {entry.text}
        </Text>
      </Stack>
    </Paper>
  );
}
