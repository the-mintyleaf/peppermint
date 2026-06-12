"use client";

import { useCallback, useRef } from "react";
import { SimpleGrid, Select, TextInput, useDebouncedCallback } from "@zetsel/ui";
import type { DocumentConfigBarProps, CertificateContent } from "../../documents.types";

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
  const content = document.content as CertificateContent;
  const contentRef = useRef(content);
  contentRef.current = content;

  const debouncedUpdate = useDebouncedCallback((patch: Partial<CertificateContent>) => {
    onUpdate({ ...contentRef.current, ...patch });
  }, 400);

  const handleChange = useCallback(
    (patch: Partial<CertificateContent>) => {
      debouncedUpdate(patch);
    },
    [debouncedUpdate]
  );

  const signatureOptions = [
    { value: "", label: "Blank" },
    ...signatures.map((sig) => ({ value: sig.id, label: sig.name })),
  ];

  return (
    <div>
      <SimpleGrid cols={{ base: 2, lg: 4 }} spacing={6} p="xs" maw={900} mx="auto">
        <TextInput
          size="xs"
          label="Issue Date"
          type="date"
          value={content.issue ?? content.issueDate ?? ""}
          onChange={(e) => handleChange({
            issue: e.currentTarget.value,
            issueDate: e.currentTarget.value
          })}
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
