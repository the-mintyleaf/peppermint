"use client";

import { useState } from "react";
import {
  Button,
  Center,
  Group,
  Loader,
  Modal,
  Radio,
  ScrollArea,
  Stack,
  Text,
} from "@peppermint/ui";
// Concrete-file import, never the uploaded-files barrel — cycle-safe (dispatch-brief precedent).
import { useFilesList } from "@/modules/admin/uploaded-files/uploadedFiles.hooks";
import type { UploadedFile } from "@/modules/admin/uploaded-files/uploadedFiles.types";
import type { EvidencePickerModalProps } from "./EvidencePickerModal.types";

/**
 * Scopes the picker to this checklist's OWN applicant (`useFilesList({
 * applicant })`, uploaded-files' `FileOwnerScope`) so `CHECKLISTS_EVIDENCE_NOT_ALLOWED`
 * — a file belonging to another applicant — can never be produced from this
 * picker (§8/§9, "scope the picker to this applicant's files so it cannot happen").
 */
export function EvidencePickerModal({
  applicantId,
  opened,
  onClose,
  onSelect,
}: EvidencePickerModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data, isLoading, isError, refetch } = useFilesList({
    applicant: applicantId,
  });
  const files = data?.data ?? [];

  const handleClose = () => {
    setSelectedId(null);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Attach evidence"
      centered
    >
      <Stack gap="md" p="md">
        {isLoading ? (
          <Center h={120}>
            <Loader size="sm" />
          </Center>
        ) : isError ? (
          <Stack align="center" gap="xs" py="md">
            <Text size="xs" c="dimmed">
              Couldn&apos;t load this applicant&apos;s files.
            </Text>
            <Button size="xs" variant="default" onClick={() => refetch()}>
              Try again
            </Button>
          </Stack>
        ) : files.length === 0 ? (
          <Text size="xs" c="dimmed">
            This applicant has no uploaded files yet.
          </Text>
        ) : (
          <ScrollArea.Autosize mah={320}>
            <Radio.Group value={selectedId ?? ""} onChange={setSelectedId}>
              <Stack gap="xs">
                {files.map((file: UploadedFile) => (
                  <Radio
                    key={file.id}
                    value={file.id}
                    label={`${file.original_filename} (v${file.version_number})`}
                  />
                ))}
              </Stack>
            </Radio.Group>
          </ScrollArea.Autosize>
        )}

        <Group justify="flex-end" gap="xs">
          <Button variant="default" size="xs" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            size="xs"
            disabled={!selectedId}
            onClick={() => {
              if (selectedId) onSelect(selectedId);
            }}
          >
            Use this file
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
