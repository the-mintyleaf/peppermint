"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Stack, Switch, Text, TextInput } from "@peppermint/ui";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import { useDocumentEditor } from "../../context";
import type {
  DocumentConfigBarProps,
  WodaContent,
} from "../../documents.types";
import {
  WODA_REFERENCE_LINES,
  isReferenceLineShown,
  referenceLineValue,
  restoreWodaReference,
  switchChange,
  valueChange,
  withWodaReferenceChange,
} from "./WodaConfigBar.utils";
import type {
  WodaReferenceChange,
  WodaReferenceLineControlProps,
} from "./WodaConfigBar.types";

const PERSIST_DEBOUNCE_MS = 400;

const inputStyles = {
  label: { fontSize: "var(--mantine-font-size-xs)" },
  input: { fontSize: "var(--mantine-font-size-xs)", minHeight: 28, height: 28 },
};

/**
 * Every WODA letter's Customizations panel: which numbers print under the
 * letterhead (reference no., dispatch no.) and what they say. They are print
 * choices about this copy of the letter, not facts about the applicant, so they
 * live here rather than in Edit fields.
 *
 * Every change previews at once (`onUpdate`) and is saved after a short pause
 * (`onPersist`), merged onto the freshest content — `content` is PATCHed
 * wholesale — with a flush on unmount so closing the panel or switching
 * document never loses it. Only the panel's own keys are written. If the save
 * is refused, those keys are put back to what was saved and the panel says so,
 * so preview and print never show a choice the server did not keep.
 */
export function WodaConfigBar({
  document: doc,
  onUpdate,
  onPersist,
  disabled,
}: DocumentConfigBarProps) {
  const { isActiveDocumentEditable, markUnsavedChanges } = useDocumentEditor();
  const content = doc.content as WodaContent;
  const locked = Boolean(disabled) || !isActiveDocumentEditable;

  // Latest content / callbacks, read at flush time (not during render) — same
  // pattern, and same reasons, as `CertificateConfigBar`.
  const contentRef = useRef(content);
  const onPersistRef = useRef(onPersist);
  const onUpdateRef = useRef(onUpdate);
  const docIdRef = useRef(doc.id);
  // eslint-disable-next-line react-hooks/refs
  contentRef.current = content;
  // eslint-disable-next-line react-hooks/refs
  onPersistRef.current = onPersist;
  // eslint-disable-next-line react-hooks/refs
  onUpdateRef.current = onUpdate;
  // eslint-disable-next-line react-hooks/refs
  docIdRef.current = doc.id;

  const pendingRef = useRef<WodaReferenceChange>({});
  // The content before the first unsaved change — what a refused save restores
  // the panel's keys from.
  const savedContentRef = useRef<WodaContent | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Which save is the newest sent, so an older one's outcome can't undo it.
  const saveSeqRef = useRef(0);
  const [refusal, setRefusal] = useState<string | null>(null);

  const persistNow = useCallback(() => {
    const change = pendingRef.current;
    if (Object.keys(change).length === 0) return;
    const saved = savedContentRef.current;
    pendingRef.current = {};
    savedContentRef.current = null;
    const savedFor = docIdRef.current;
    const seq = ++saveSeqRef.current;
    const saving = onPersistRef.current?.(
      withWodaReferenceChange(contentRef.current, change),
    );
    if (!(saving instanceof Promise)) return;
    saving.then(
      () => {
        setRefusal(null);
        // The save's reply rewrites the cache with what was sent. Anything typed
        // while it was in flight is still pending: put it back on top, or the
        // input would snap back and lose those characters.
        if (
          docIdRef.current === savedFor &&
          Object.keys(pendingRef.current).length > 0
        ) {
          onUpdateRef.current(
            withWodaReferenceChange(contentRef.current, pendingRef.current),
          );
        }
      },
      (error: unknown) => {
        // Only undo the preview of the document this change was made on, and
        // only if no later save has been sent — that one carries this change
        // too and may have succeeded. Keep any change still waiting to save.
        if (
          saved &&
          docIdRef.current === savedFor &&
          seq === saveSeqRef.current
        ) {
          onUpdateRef.current(
            withWodaReferenceChange(
              restoreWodaReference(contentRef.current, saved),
              pendingRef.current,
            ),
          );
        }
        setRefusal(getApiErrorMessage(error));
      },
    );
  }, []);

  const schedulePersist = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      persistNow();
    }, PERSIST_DEBOUNCE_MS);
  }, [persistNow]);

  // Flush a pending change if this instance unmounts inside the debounce window
  // (panel closed, document switched). Cleanup reads this instance's own refs,
  // so it always saves to the document the change was made on.
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        persistNow();
      }
    };
  }, [persistNow]);

  const handleChange = useCallback(
    (change: WodaReferenceChange) => {
      if (locked) return;
      markUnsavedChanges();
      if (savedContentRef.current === null) {
        savedContentRef.current = contentRef.current;
      }
      pendingRef.current = { ...pendingRef.current, ...change };
      onUpdate(withWodaReferenceChange(contentRef.current, change));
      schedulePersist();
    },
    [locked, markUnsavedChanges, onUpdate, schedulePersist],
  );

  return (
    <Stack gap="md" p="xs">
      {refusal ? (
        <Alert color="red" variant="light" p="xs">
          <Stack gap={4}>
            <Text size="xs">Not saved: {refusal}</Text>
            <Text size="xs">
              The letter still prints as it did before. Make the change again to
              retry.
            </Text>
          </Stack>
        </Alert>
      ) : null}
      {WODA_REFERENCE_LINES.map((line) => (
        <ReferenceLineControl
          key={line.showKey}
          line={line}
          content={content}
          disabled={locked}
          onChange={handleChange}
        />
      ))}
    </Stack>
  );
}

/** One header line: its print switch, and its number while the switch is on. */
function ReferenceLineControl({
  line,
  content,
  disabled,
  onChange,
}: WodaReferenceLineControlProps) {
  const shown = isReferenceLineShown(content, line);

  return (
    <Stack gap={6}>
      <Switch
        size="xs"
        label={line.switchLabel}
        checked={shown}
        disabled={disabled}
        onChange={(event) =>
          onChange(switchChange(line, event.currentTarget.checked))
        }
      />
      {shown ? (
        <TextInput
          size="xs"
          label={line.inputLabel}
          placeholder={line.placeholder}
          value={referenceLineValue(content, line)}
          disabled={disabled}
          onChange={(event) =>
            onChange(valueChange(line, event.currentTarget.value))
          }
          styles={inputStyles}
        />
      ) : null}
    </Stack>
  );
}
