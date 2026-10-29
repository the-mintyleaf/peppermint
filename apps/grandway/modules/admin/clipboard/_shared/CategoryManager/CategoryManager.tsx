"use client";

import { useState } from "react";
import {
  ActionIcon,
  Alert,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Tooltip,
  modals,
} from "@peppermint/ui";
import { CaretLeftIcon } from "@phosphor-icons/react/dist/csr/CaretLeft";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import {
  CLIPBOARD_CATEGORY_LIMIT,
  CLIPBOARD_CATEGORY_NAME_MAX,
  CLIPBOARD_CONFIRM_Z_INDEX,
} from "../../clipboard.constants";
import {
  useCreateClipboardCategory,
  useDeleteClipboardCategory,
  useRenameClipboardCategory,
} from "../../clipboard.hooks";
import type { ClipboardCategory } from "../../clipboard.types";
import type { CategoryManagerProps } from "./CategoryManager.types";

function CategoryRow({
  category,
  onDeleted,
}: {
  category: ClipboardCategory;
  onDeleted?: (categoryId: string) => void;
}) {
  const rename = useRenameClipboardCategory();
  const remove = useDeleteClipboardCategory();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);

  const trimmed = name.trim();
  const canSave = trimmed.length > 0 && trimmed !== category.name;

  const save = () => {
    if (!canSave) return;
    rename.mutate(
      { id: category.id, name: trimmed },
      { onSuccess: () => setEditing(false) },
    );
  };

  const confirmDelete = () =>
    modals.openConfirmModal({
      title: `Delete “${category.name}”?`,
      children:
        category.entry_count > 0
          ? `Your ${category.entry_count} snippet${category.entry_count === 1 ? "" : "s"} in this category will be kept and become uncategorised.`
          : "This category is empty. Nothing else is affected.",
      labels: { confirm: "Delete category", cancel: "Keep it" },
      confirmProps: { color: "red" },
      // The app theme zeroes modal body padding; confirm modals restore it via `inner`.
      styles: { inner: { padding: "var(--mantine-spacing-md)" } },
      zIndex: CLIPBOARD_CONFIRM_Z_INDEX,
      onConfirm: () =>
        remove.mutate(category.id, {
          onSuccess: () => onDeleted?.(category.id),
        }),
    });

  if (editing) {
    return (
      <Paper withBorder radius="md" p="sm">
        <Group gap="xs" wrap="nowrap" align="flex-start">
          <TextInput
            aria-label={`New name for ${category.name}`}
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            maxLength={CLIPBOARD_CATEGORY_NAME_MAX}
            data-autofocus
            style={{ flex: 1 }}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") setEditing(false);
            }}
          />
          <Tooltip label="Save name">
            <ActionIcon
              size="lg"
              onClick={save}
              disabled={!canSave}
              loading={rename.isPending}
              aria-label="Save name"
            >
              <CheckIcon size={16} aria-hidden />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Cancel">
            <ActionIcon
              size="lg"
              variant="default"
              onClick={() => {
                setName(category.name);
                setEditing(false);
              }}
              aria-label="Cancel rename"
            >
              <XIcon size={16} aria-hidden />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Paper>
    );
  }

  return (
    <Paper withBorder radius="md" p="sm">
      <Group justify="space-between" wrap="nowrap">
        <Stack gap={0} miw={0}>
          <Text fw={600} size="sm" truncate>
            {category.name}
          </Text>
          <Text size="xs" c="dimmed">
            {category.entry_count} snippet
            {category.entry_count === 1 ? "" : "s"}
          </Text>
        </Stack>
        <Group gap={4} wrap="nowrap">
          <Tooltip label="Rename">
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => setEditing(true)}
              aria-label={`Rename ${category.name}`}
            >
              <PencilSimpleIcon size={16} aria-hidden />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete">
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={confirmDelete}
              loading={remove.isPending}
              aria-label={`Delete ${category.name}`}
            >
              <TrashIcon size={16} aria-hidden />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Paper>
  );
}

/**
 * Create, rename and delete categories — a view inside the drawer, not a modal on top
 * of it. Deleting is safe by contract (entries are kept, uncategorised), and the
 * confirmation says how many. At the 50-category cap the create control is replaced by
 * the explanation and the way out (delete one) rather than failing after submit.
 */
export function CategoryManager({
  categories,
  onBack,
  onCategoryDeleted,
}: CategoryManagerProps) {
  const create = useCreateClipboardCategory();
  const [newName, setNewName] = useState("");
  const atLimit = categories.length >= CLIPBOARD_CATEGORY_LIMIT;
  const trimmed = newName.trim();

  const add = () => {
    if (!trimmed || atLimit) return;
    create.mutate(trimmed, { onSuccess: () => setNewName("") });
  };

  return (
    <Stack gap="md">
      <Group>
        <Button
          variant="subtle"
          color="gray"
          size="compact-sm"
          leftSection={<CaretLeftIcon size={14} aria-hidden />}
          onClick={onBack}
        >
          Back to snippets
        </Button>
      </Group>

      {atLimit ? (
        <Alert
          color="yellow"
          icon={<WarningIcon size={16} aria-hidden />}
          title="Category limit reached"
        >
          You have {CLIPBOARD_CATEGORY_LIMIT} categories, the most allowed.
          Delete one you no longer use to add another. Its snippets are kept.
        </Alert>
      ) : (
        <Group align="flex-end" gap="xs" wrap="nowrap">
          <TextInput
            label="New category"
            placeholder="e.g. Ward office"
            value={newName}
            onChange={(e) => setNewName(e.currentTarget.value)}
            maxLength={CLIPBOARD_CATEGORY_NAME_MAX}
            style={{ flex: 1 }}
            onKeyDown={(e) => {
              if (e.key === "Enter") add();
            }}
          />
          <Button
            leftSection={<PlusIcon size={14} aria-hidden />}
            onClick={add}
            disabled={!trimmed}
            loading={create.isPending}
          >
            Add
          </Button>
        </Group>
      )}

      {categories.length === 0 ? (
        <Text size="sm" c="dimmed">
          No categories yet. Add one above to group your snippets, for example
          “Ward office” or “Bank”.
        </Text>
      ) : (
        <Stack gap="xs">
          <Text size="xs" c="dimmed">
            {categories.length} of {CLIPBOARD_CATEGORY_LIMIT} categories
          </Text>
          {categories.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              onDeleted={onCategoryDeleted}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
