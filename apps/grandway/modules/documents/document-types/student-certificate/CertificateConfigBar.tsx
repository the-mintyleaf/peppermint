"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, List, Stack, Select, DateInput, Text } from "@peppermint/ui";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import { useDraftSignatoryCount } from "./useDraftSignatoryCount";
import { useDocumentEditor } from "../../context";
import { certificateSignatureOptions } from "./certificateSignatureOptions";
import {
  normalizeCertificateContent,
  withCertificatePanelChange,
  type CertificatePanelChange,
} from "./certificateContent";
import {
  contentPathLabel,
  getContentFieldErrors,
} from "../../utils/contentFieldErrors";
import type {
  DocumentConfigBarProps,
  CertificateContent,
} from "../../documents.types";
import type {
  CertificatePanelRefusal,
  CertificatePanelRefusalProps,
} from "./CertificateForm.types";

const PERSIST_DEBOUNCE_MS = 400;

function toRefusal(error: unknown): CertificatePanelRefusal {
  const fields = getContentFieldErrors(error);
  return fields
    ? { kind: "fields", fields }
    : { kind: "other", message: getApiErrorMessage(error) };
}

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
 *
 * **The panel never migrates a body.** It writes only its own four keys (in the
 * new names) onto the stored content as it is — see `withCertificatePanelChange`.
 * Rewriting an older certificate wholesale from a signatory pick could lose data
 * and trip rules the operator cannot see from here; that migration belongs to an
 * Edit-fields save. If the backend still refuses the body (older data that breaks
 * today's rules), the preview is put back to the last saved content and the
 * panel says which fields to fix in Edit fields — so preview and print never
 * show a choice the server did not keep.
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
  const fields = normalizeCertificateContent(content);

  // Latest content / persist target, read at flush time (not during render) —
  // same pattern, and same reasons, as `CvEuropassConfigBar`.
  const contentRef = useRef(content);
  const onPersistRef = useRef(onPersist);
  const onUpdateRef = useRef(onUpdate);
  const docIdRef = useRef(doc.id);
  // eslint-disable-next-line react-hooks/refs
  docIdRef.current = doc.id;
  // eslint-disable-next-line react-hooks/refs
  contentRef.current = content;
  // eslint-disable-next-line react-hooks/refs
  onPersistRef.current = onPersist;
  // eslint-disable-next-line react-hooks/refs
  onUpdateRef.current = onUpdate;

  const pendingRef = useRef<CertificatePanelChange>({});
  // The content as it stood before the first unsaved change — what a refused
  // save puts the preview back to.
  const savedContentRef = useRef<CertificateContent | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [refusal, setRefusal] = useState<CertificatePanelRefusal | null>(null);

  // Persist from the FRESHEST content plus every field changed inside the
  // debounce window. `content` is PATCHed wholesale, so merging the latest cache
  // content stops a delayed save clobbering an intervening one.
  const persistNow = useCallback(() => {
    if (Object.keys(pendingRef.current).length === 0) return;
    const change = pendingRef.current;
    const saved = savedContentRef.current;
    pendingRef.current = {};
    savedContentRef.current = null;
    const savedFor = docIdRef.current;
    const saving = onPersistRef.current?.(
      withCertificatePanelChange(contentRef.current, change),
    );
    if (!(saving instanceof Promise)) return;
    saving.then(
      () => setRefusal(null),
      (error: unknown) => {
        // Only undo the preview of the document this change was made on.
        if (saved && docIdRef.current === savedFor) onUpdateRef.current(saved);
        setRefusal(toRefusal(error));
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
    (change: CertificatePanelChange) => {
      markUnsavedChanges();
      if (savedContentRef.current === null) {
        savedContentRef.current = contentRef.current;
      }
      pendingRef.current = { ...pendingRef.current, ...change };
      onUpdate(withCertificatePanelChange(contentRef.current, change));
      schedulePersist();
    },
    [markUnsavedChanges, onUpdate, schedulePersist],
  );

  const signatureOptions = certificateSignatureOptions(signatures);

  return (
    <Stack gap="md" p="xs">
      {refusal ? <PanelRefusal refusal={refusal} /> : null}
      <DateInput
        size="xs"
        label="Issue Date"
        valueFormat="YYYY-MM-DD"
        clearable
        value={fields.issue || null}
        onChange={(value) => handleChange({ issue: value ?? "" })}
        disabled={disabled}
        styles={inputStyles}
      />
      <Select
        size="xs"
        label="Instructor"
        placeholder="Select instructor"
        data={signatureOptions}
        value={fields.instructor_id ?? ""}
        onChange={(v) => handleChange({ instructor_id: v || null })}
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
        value={fields.director_id ?? ""}
        onChange={(v) => handleChange({ director_id: v || null })}
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
        value={String(fields.study_type)}
        onChange={(v) => handleChange({ study_type: v === "1" ? 1 : 0 })}
        disabled={disabled}
        styles={inputStyles}
      />
    </Stack>
  );
}

/**
 * Why the last panel change was not kept. A field refusal is about the
 * certificate's older data, not the panel's choice, so it says where to fix it.
 */
function PanelRefusal({ refusal }: CertificatePanelRefusalProps) {
  if (refusal.kind === "other") {
    return (
      <Alert color="red" variant="light" p="xs">
        <Text size="xs">Not saved — {refusal.message}</Text>
      </Alert>
    );
  }
  return (
    <Alert color="red" variant="light" p="xs">
      <Stack gap={4}>
        <Text size="xs">
          Not saved. This certificate has details the server now refuses, so
          nothing here can be saved until they are fixed. Open Edit fields (the
          pencil button), correct these and save:
        </Text>
        <List size="xs" spacing={2}>
          {Object.entries(refusal.fields).map(([path, message]) => (
            <List.Item key={path}>
              {contentPathLabel(path)}: {message}
            </List.Item>
          ))}
        </List>
      </Stack>
    </Alert>
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
