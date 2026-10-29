"use client";

import { useState } from "react";
import { Button, Group, Stack, Text, TextInput } from "@peppermint/ui";
import { BookmarkSimpleIcon } from "@phosphor-icons/react/dist/csr/BookmarkSimple";
import {
  CLIPBOARD_LABEL_MAX,
  CLIPBOARD_TEXT_MAX,
} from "../../../clipboard.constants";
import { useCreateClipboardEntry } from "../../../clipboard.hooks";
import { STOP_MODAL_ESCAPE } from "../ClipboardFieldSuggest.constants";
import type { ClipboardSaveValueProps } from "../ClipboardFieldSuggest.types";

const DEFAULT_LABEL_CHARS = 40;

/**
 * "Save this value" — the field already holds the text, so the only thing left to ask
 * is what to call it. The name is pre-filled (the field's name, else the start of the
 * text) so saving is one click; the snippet is filed against this field's key so it
 * comes back as a suggestion next time.
 */
export function SaveFieldValue({
  fieldKey,
  value,
  fieldLabel,
  fieldKeyLabel,
  onSaved,
}: ClipboardSaveValueProps) {
  const create = useCreateClipboardEntry();
  const text = value.trim();
  const [asking, setAsking] = useState(false);
  const [label, setLabel] = useState("");

  const start = () => {
    setLabel(
      (fieldLabel ?? text).slice(
        0,
        Math.min(DEFAULT_LABEL_CHARS, CLIPBOARD_LABEL_MAX),
      ),
    );
    setAsking(true);
  };

  const tooLong = text.length > CLIPBOARD_TEXT_MAX;

  const save = () => {
    const name = label.trim();
    // Enter can fire again while the first save is in flight.
    if (!name || tooLong || create.isPending) return;
    create.mutate(
      { label: name, text, field_key: fieldKey },
      {
        onSuccess: () => {
          setAsking(false);
          onSaved();
        },
      },
    );
  };

  if (!asking) {
    return (
      <Button
        variant="light"
        size="compact-sm"
        leftSection={<BookmarkSimpleIcon size={14} aria-hidden />}
        onClick={start}
        {...STOP_MODAL_ESCAPE}
      >
        Save this value
      </Button>
    );
  }

  return (
    <Stack gap="xs">
      <TextInput
        label="Name this snippet"
        size="xs"
        value={label}
        maxLength={CLIPBOARD_LABEL_MAX}
        data-autofocus
        onChange={(e) => setLabel(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key !== "Enter") return;
          // Never let Enter reach the document form this popover belongs to.
          e.preventDefault();
          e.stopPropagation();
          save();
        }}
        error={label.trim() ? undefined : "Give it a short name."}
        {...STOP_MODAL_ESCAPE}
      />
      <Text size="xs" c="dimmed" lineClamp={2}>
        {text}
      </Text>
      <Text size="xs" c="dimmed">
        Offered again on: {fieldKeyLabel}
      </Text>
      {tooLong ? (
        <Text size="xs" c="red">
          Too long to save: a snippet holds up to {CLIPBOARD_TEXT_MAX}{" "}
          characters.
        </Text>
      ) : null}
      <Group justify="flex-end" gap="xs">
        <Button
          variant="subtle"
          color="gray"
          size="compact-sm"
          onClick={() => setAsking(false)}
          disabled={create.isPending}
          {...STOP_MODAL_ESCAPE}
        >
          Cancel
        </Button>
        <Button
          size="compact-sm"
          onClick={save}
          loading={create.isPending}
          disabled={!label.trim() || tooLong}
          {...STOP_MODAL_ESCAPE}
        >
          Save
        </Button>
      </Group>
    </Stack>
  );
}
