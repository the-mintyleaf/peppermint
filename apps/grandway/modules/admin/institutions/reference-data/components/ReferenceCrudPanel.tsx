"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Group,
  Skeleton,
  Stack,
  Switch,
  Text,
} from "@peppermint/ui";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import type { ReferenceCrudPanelProps } from "./ReferenceCrudPanel.types";

/**
 * Generic scaffold for a tab of reference records (Countries / Fields): the
 * show-retired toggle, the Add affordance, and the add/edit inline-form swap.
 * Entity-specific create/edit forms and cards come in as render props so this
 * stays DRY across two differently-shaped resources.
 */
export function ReferenceCrudPanel<T extends { id: string }>({
  entityLabel,
  entries,
  isEntryActive,
  isLoading,
  isError,
  onRetry,
  renderCreateForm,
  renderEditForm,
  renderCard,
  onDraftStateChange,
}: ReferenceCrudPanelProps<T>) {
  const [showRetired, setShowRetired] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    onDraftStateChange?.(adding || editingId !== null);
  }, [adding, editingId, onDraftStateChange]);

  const visible = showRetired ? entries : entries.filter(isEntryActive);
  const retiredCount = entries.filter((e) => !isEntryActive(e)).length;

  if (isError) {
    return (
      <Alert
        variant="light"
        color="red"
        icon={<WarningIcon size={16} aria-hidden />}
        title={`Couldn't load ${entityLabel}s`}
      >
        <Stack gap="xs" align="flex-start">
          <Text size="sm">Check your connection and try again.</Text>
          <Button size="xs" variant="light" color="red" onClick={onRetry}>
            Retry
          </Button>
        </Stack>
      </Alert>
    );
  }

  return (
    <Stack gap="sm">
      <Group justify="space-between">
        <Switch
          size="sm"
          label="Show withdrawn"
          checked={showRetired}
          onChange={(e) => setShowRetired(e.currentTarget.checked)}
          disabled={isLoading}
        />
        <Button
          size="xs"
          leftSection={<PlusIcon size={14} aria-hidden />}
          onClick={() => {
            setEditingId(null);
            setAdding(true);
          }}
          disabled={isLoading || adding}
        >
          Add {entityLabel}
        </Button>
      </Group>

      {isLoading ? (
        <Stack gap="xs">
          <Skeleton height={64} radius="md" />
          <Skeleton height={64} radius="md" />
          <Skeleton height={64} radius="md" />
        </Stack>
      ) : (
        <Stack gap="xs">
          {adding ? renderCreateForm(() => setAdding(false)) : null}

          {visible.length === 0 && !adding ? (
            <Text size="sm" c="dimmed">
              {entries.length === 0
                ? `No ${entityLabel}s yet — add the first one above.`
                : `All ${retiredCount} ${entityLabel}${retiredCount === 1 ? "" : "s"} are withdrawn. Turn on “Show withdrawn” to see them.`}
            </Text>
          ) : (
            visible.map((entry) =>
              editingId === entry.id
                ? renderEditForm(entry, () => setEditingId(null))
                : renderCard(entry, () => {
                    setAdding(false);
                    setEditingId(entry.id);
                  }),
            )
          )}
        </Stack>
      )}
    </Stack>
  );
}
