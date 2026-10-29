"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import {
  ActionIcon,
  Button,
  Divider,
  Loader,
  Popover,
  Stack,
  Text,
  Tooltip,
  UnstyledButton,
} from "@peppermint/ui";
import { ClipboardIcon } from "@phosphor-icons/react/dist/csr/Clipboard";
import {
  useClipboardSuggestions,
  useMarkClipboardEntryUsed,
} from "../../clipboard.hooks";
import { fieldKeyLabel as registeredFieldKeyLabel } from "../../clipboard.fieldKeys";
import type { ClipboardEntry } from "../../clipboard.types";
import { SaveFieldValue } from "./components/SaveFieldValue";
import { STOP_MODAL_ESCAPE } from "./ClipboardFieldSuggest.constants";
import type { ClipboardFieldSuggestProps } from "./ClipboardFieldSuggest.types";

/**
 * A small clipboard button a document form attaches beside a text input. Nothing is
 * fetched until the popover is opened (on demand — suggestions cost a request against
 * the hourly rate, so never per keystroke). The dropdown lists this field's saved
 * snippets most-used first; choosing one hands its text to `onInsert` and bumps its
 * ranking. When the input already holds text it also offers "Save this value".
 *
 * Safe inside a form Modal: every control is a `type="button"`, the dropdown is
 * portalled (so Enter in it never submits the host form), and Escape closes only the
 * popover — the focused element carries `data-mantine-stop-propagation`, which every
 * Mantine Modal/Drawer checks before closing itself on Escape.
 *
 * Owner-only for every authority, so it is safe to render for any signed-in account.
 * States: loading → a spinner row; request-failed → message + Retry; empty → says nothing
 * is saved for this field yet (and, with text typed, offers to save it); disabled → the
 * button is inert.
 */
export function ClipboardFieldSuggest({
  fieldKey,
  value,
  onInsert,
  fieldLabel,
  fieldKeyLabel,
  disabled = false,
  size = "md",
  popoverZIndex,
}: ClipboardFieldSuggestProps) {
  const [opened, setOpened] = useState(false);
  const suggestions = useClipboardSuggestions(fieldKey, opened);
  const { mutate: markUsed } = useMarkClipboardEntryUsed();
  const hasText = value.trim().length > 0;
  const entries = suggestions.data?.data ?? [];
  const keyLabel = fieldKeyLabel ?? registeredFieldKeyLabel(fieldKey);
  const buttonLabel = fieldLabel
    ? `Saved snippets for ${fieldLabel}`
    : "Insert from saved snippets";

  const choose = (entry: ClipboardEntry) => {
    onInsert(entry.text);
    markUsed(entry.id);
    setOpened(false);
  };

  function renderEntries(): ReactNode {
    if (suggestions.isError) {
      return (
        <Stack gap="xs" align="flex-start">
          <Text size="sm" c="red">
            Couldn&apos;t load your saved snippets.
          </Text>
          <Button
            size="compact-sm"
            variant="default"
            onClick={() => suggestions.refetch()}
            loading={suggestions.isRefetching}
            {...STOP_MODAL_ESCAPE}
          >
            Retry
          </Button>
        </Stack>
      );
    }
    if (suggestions.isPending) {
      return <Loader size="sm" aria-label="Loading saved snippets" />;
    }
    if (entries.length === 0) {
      return (
        <Text size="sm" c="dimmed">
          Nothing saved for this field yet.
          {hasText ? "" : " Type a value, then save it here to reuse it."}
        </Text>
      );
    }
    return (
      <Stack gap={2}>
        {entries.map((entry) => (
          <UnstyledButton
            key={entry.id}
            onClick={() => choose(entry)}
            p="xs"
            style={{ borderRadius: "var(--mantine-radius-sm)" }}
            aria-label={`Insert ${entry.label}`}
            {...STOP_MODAL_ESCAPE}
          >
            <Text size="sm" fw={600} truncate>
              {entry.label}
            </Text>
            <Text
              size="xs"
              c="dimmed"
              lineClamp={2}
              style={{ whiteSpace: "pre-line", overflowWrap: "anywhere" }}
            >
              {entry.text}
            </Text>
          </UnstyledButton>
        ))}
      </Stack>
    );
  }

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom-end"
      width={320}
      shadow="md"
      withinPortal
      trapFocus
      zIndex={popoverZIndex}
    >
      <Popover.Target>
        <Tooltip label="Saved snippets" disabled={opened}>
          {/* Subtle and grey so it reads as a quiet aid, not a second input. */}
          <ActionIcon
            type="button"
            variant="subtle"
            color="gray"
            size={size}
            disabled={disabled}
            onClick={() => setOpened((o) => !o)}
            aria-label={buttonLabel}
            aria-expanded={opened}
            // Mirrors Mantine's Combobox: while open, Escape belongs to the popover.
            data-mantine-stop-propagation={opened}
          >
            <ClipboardIcon size={size === "xs" ? 12 : 16} aria-hidden />
          </ActionIcon>
        </Tooltip>
      </Popover.Target>
      <Popover.Dropdown p="sm" {...STOP_MODAL_ESCAPE}>
        <Stack gap="sm">
          {renderEntries()}
          {hasText ? (
            <>
              <Divider />
              <SaveFieldValue
                fieldKey={fieldKey}
                value={value}
                fieldLabel={fieldLabel}
                fieldKeyLabel={keyLabel}
                onSaved={() => setOpened(false)}
              />
            </>
          ) : null}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
