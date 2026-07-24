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
import { ReferenceEntryCard } from "./ReferenceEntryCard";
import { ReferenceEntryForm } from "./ReferenceEntryForm";
import type { ReferenceEntryPanelProps } from "./ReferenceEntryPanel.types";

export function ReferenceEntryPanel({
  entityLabel,
  entries,
  isLoading,
  isError,
  onRetry,
  onCreate,
  isCreating,
  onUpdate,
  isUpdating,
  onSetActive,
  settingActiveId,
  isTogglingActive,
  onDraftStateChange,
}: ReferenceEntryPanelProps) {
  const [showRetired, setShowRetired] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    onDraftStateChange?.(adding || editingId !== null);
  }, [adding, editingId, onDraftStateChange]);

  // Close the inline form on a successful save — otherwise a cleared-but-open
  // create form (or a saved-but-still-mounted edit form) keeps reporting a
  // draft to `onDraftStateChange` even though nothing is actually unsaved.
  const handleCreate: typeof onCreate = async (values) => {
    const result = await onCreate(values);
    if (result.ok) setAdding(false);
    return result;
  };
  const handleUpdate = async (
    id: string,
    values: Parameters<typeof onUpdate>[1],
  ) => {
    const result = await onUpdate(id, values);
    if (result.ok) setEditingId(null);
    return result;
  };

  const visibleEntries = showRetired
    ? entries
    : entries.filter((e) => e.is_active);
  const retiredCount = entries.filter((e) => !e.is_active).length;

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
          label="Show retired"
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
          {adding ? (
            <ReferenceEntryForm
              mode="create"
              isSubmitting={isCreating}
              onSubmit={handleCreate}
              onCancel={() => setAdding(false)}
            />
          ) : null}

          {visibleEntries.length === 0 && !adding ? (
            <Text size="sm" c="dimmed">
              {entries.length === 0
                ? `No ${entityLabel}s yet — add the first one above.`
                : `All ${retiredCount} ${entityLabel}${retiredCount === 1 ? "" : "s"} are retired. Turn on “Show retired” to see them.`}
            </Text>
          ) : (
            visibleEntries.map((entry) =>
              editingId === entry.id ? (
                <ReferenceEntryForm
                  key={entry.id}
                  mode="edit"
                  initialEntry={entry}
                  isSubmitting={isUpdating}
                  onSubmit={(values) => handleUpdate(entry.id, values)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <ReferenceEntryCard
                  key={entry.id}
                  entry={entry}
                  onEdit={() => {
                    setAdding(false);
                    setEditingId(entry.id);
                  }}
                  onSetActive={(isActive) => onSetActive(entry.id, isActive)}
                  isSettingActive={settingActiveId === entry.id}
                  activeToggleDisabled={isTogglingActive}
                />
              ),
            )
          )}
        </Stack>
      )}
    </Stack>
  );
}
