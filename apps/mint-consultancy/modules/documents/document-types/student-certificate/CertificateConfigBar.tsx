"use client";

import { useCallback, useRef } from "react";
import { SimpleGrid, Select, TextInput, useDebouncedCallback, Group, Button } from "@zetsel/ui";
import { PencilSimple as EditIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { useDocumentEditor } from "../../context";
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
  const { setEditFieldsModalOpen } = useDocumentEditor();
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
      <Group justify="flex-end" p="xs" pb={0}>
        <Button
          size="xs"
          variant="light"
          leftSection={<EditIcon size={14} aria-hidden />}
          onClick={() => setEditFieldsModalOpen(true)}
        >
          Edit Fields
        </Button>
      </Group>
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
