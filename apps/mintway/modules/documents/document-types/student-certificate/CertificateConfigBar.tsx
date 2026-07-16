"use client";

import { useCallback, useRef } from "react";
import {
  SimpleGrid,
  Select,
  DateInput,
  useDebouncedCallback,
} from "@peppermint/ui";
import { useDocumentEditor } from "../../context";
import type {
  DocumentConfigBarProps,
  CertificateContent,
} from "../../documents.types";

const inputStyles = {
  label: { fontSize: "var(--mantine-font-size-xs)" },
  input: { fontSize: "var(--mantine-font-size-xs)", minHeight: 28, height: 28 },
};

export function CertificateConfigBar({
  document,
  onUpdate,
  signatures = [],
  disabled,
}: DocumentConfigBarProps) {
  const { markUnsavedChanges } = useDocumentEditor();
  const content = document.content as CertificateContent;
  // Latest-content ref read by debounced update callbacks (not during render).
  const contentRef = useRef(content);
  // eslint-disable-next-line react-hooks/refs
  contentRef.current = content;

  const debouncedUpdate = useDebouncedCallback(
    (patch: Partial<CertificateContent>) => {
      onUpdate({ ...contentRef.current, ...patch });
    },
    400,
  );

  const handleChange = useCallback(
    (patch: Partial<CertificateContent>) => {
      markUnsavedChanges();
      debouncedUpdate(patch);
    },
    [debouncedUpdate, markUnsavedChanges],
  );

  const signatureOptions = [
    { value: "", label: "Blank" },
    ...signatures.map((sig) => ({ value: sig.id, label: sig.name })),
  ];

  return (
    <div>
      <SimpleGrid
        cols={{ base: 2, lg: 4 }}
        spacing={6}
        p="xs"
        maw={900}
        mx="auto"
      >
        <DateInput
          size="xs"
          label="Issue Date"
          valueFormat="YYYY-MM-DD"
          clearable
          value={content.issue ?? content.issueDate ?? ""}
          onChange={(value) =>
            handleChange({
              issue: value ?? "",
              issueDate: value ?? "",
            })
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
      </SimpleGrid>
    </div>
  );
}
