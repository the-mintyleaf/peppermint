"use client";

import { useCallback, useEffect, useRef } from "react";
import { Alert, Stack, Select, DateInput, Text } from "@peppermint/ui";
import { useDraftSignatoryCount } from "./useDraftSignatoryCount";
import { useDocumentEditor } from "../../context";
import { certificateSignatureOptions } from "./certificateSignatureOptions";
import type {
  DocumentConfigBarProps,
  CertificateContent,
} from "../../documents.types";

const PERSIST_DEBOUNCE_MS = 400;

const inputStyles = {
  label: { fontSize: "var(--mantine-font-size-xs)" },
  input: { fontSize: "var(--mantine-font-size-xs)", minHeight: 28, height: 28 },
};

/**
 * The certificate's Customizations panel. Laid out **vertically** because it
 * lives in the editor's right rail, roughly 200px wide — the horizontal grid
 * this replaced was designed for a top toolbar that no longer exists.
 *
 * Every change does two things: `onUpdate` for an instant local preview, and a
 * debounced `onPersist` so the choice survives a reload and a print. A signatory
 * chosen here is part of the document, not a view setting, so render-only would
 * have meant a certificate that printed unsigned after a refresh.
 */
export function CertificateConfigBar({
  document: doc,
  onUpdate,
  onPersist,
  signatures = [],
  disabled,
}: DocumentConfigBarProps) {
  const { markUnsavedChanges } = useDocumentEditor();
  const content = doc.content as CertificateContent;

  // Latest content / persist target, read at flush time (not during render) —
  // same pattern, and same reasons, as `CvEuropassConfigBar`.
  const contentRef = useRef(content);
  const onPersistRef = useRef(onPersist);
  // eslint-disable-next-line react-hooks/refs
  contentRef.current = content;
  // eslint-disable-next-line react-hooks/refs
  onPersistRef.current = onPersist;

  const pendingRef = useRef<Partial<CertificateContent>>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persist from the FRESHEST content plus every field changed inside the
  // debounce window. `content` is PATCHed wholesale, so merging the latest cache
  // content stops a delayed save clobbering an intervening one.
  const persistNow = useCallback(() => {
    if (Object.keys(pendingRef.current).length === 0) return;
    const patch = pendingRef.current;
    pendingRef.current = {};
    onPersistRef.current?.({ ...contentRef.current, ...patch });
  }, []);

  const schedulePersist = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      persistNow();
    }, PERSIST_DEBOUNCE_MS);
  }, [persistNow]);

  // Flush a pending change if this instance unmounts inside the debounce window
  // — the panel closing or the active document switching — so a save is never
  // silently lost. Cleanup runs before the next document's ConfigBar mounts and
  // reads this instance's own refs, so it always persists to the right document.
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
    (patch: Partial<CertificateContent>) => {
      markUnsavedChanges();
      pendingRef.current = { ...pendingRef.current, ...patch };
      onUpdate({ ...contentRef.current, ...pendingRef.current });
      schedulePersist();
    },
    [markUnsavedChanges, onUpdate, schedulePersist],
  );

  const signatureOptions = certificateSignatureOptions(signatures);

  return (
    <Stack gap="md" p="xs">
      <DateInput
        size="xs"
        label="Issue Date"
        valueFormat="YYYY-MM-DD"
        clearable
        value={content.issue ?? content.issueDate ?? ""}
        onChange={(value) =>
          handleChange({ issue: value ?? "", issueDate: value ?? "" })
        }
        disabled={disabled}
        styles={inputStyles}
      />
      <Select
        size="xs"
        label="Instructor"
        placeholder="Select instructor"
        data={signatureOptions}
        value={content.instructorId ?? ""}
        onChange={(v) => handleChange({ instructorId: v || null })}
        searchable
        clearable
        disabled={disabled}
        styles={inputStyles}
      />
      <Select
        size="xs"
        label="Managing Director"
        placeholder="Select director"
        data={signatureOptions}
        value={content.directorId ?? ""}
        onChange={(v) => handleChange({ directorId: v || null })}
        searchable
        clearable
        disabled={disabled}
        styles={inputStyles}
      />
      {signatures.length === 0 ? <EmptyPickerHint /> : null}
      <Select
        size="xs"
        label="Study Status"
        data={[
          { value: "0", label: "Currently Studying (履修している)" },
          { value: "1", label: "Completed (履修した)" },
        ]}
        value={String(content.studyType)}
        onChange={(v) => handleChange({ studyType: v === "1" ? 1 : 0 })}
        disabled={disabled}
        styles={inputStyles}
      />
    </Stack>
  );
}

/**
 * The picker lists **active** signatories only, so an empty one has two very
 * different causes and the operator cannot tell them apart from here. Naming
 * the real one matters: "you have signers, none of them are switched on" is a
 * one-click fix, and without it a freshly created signatory silently fails to
 * appear with no explanation.
 *
 * The inactive count is only fetched when the picker is actually empty, so the
 * normal case costs nothing.
 */
function EmptyPickerHint() {
  const inactiveCount = useDraftSignatoryCount();

  if (inactiveCount > 0) {
    return (
      <Alert variant="light" color="yellow" p="xs">
        <Text size="xs">
          {inactiveCount === 1
            ? "1 signatory exists but is not active yet."
            : `${inactiveCount} signatories exist but none are active yet.`}{" "}
          Open the signature button in the top bar and activate the one you need
          — only active signers appear here.
        </Text>
      </Alert>
    );
  }

  return (
    <Text size="xs" c="dimmed">
      No signatories yet. Add one from the signature button in the top bar,
      upload their signature, then activate them.
    </Text>
  );
}
