"use client";

import { useState } from "react";
import {
  ActionIcon,
  Button,
  FileButton,
  Group,
  Loader,
  Modal,
  ModalPaper,
  Select,
  Stack,
  Table,
  Text,
  Title,
  modals,
  notifications,
  useQuery,
} from "@peppermint/ui";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { UploadSimpleIcon } from "@phosphor-icons/react/dist/csr/UploadSimple";

import { getApiErrorMessage } from "@/lib/authErrorMessages";
import {
  EVIDENCE_MEDIA_CATEGORY_LABELS,
  mediaKeys,
  toOptions,
  useApplicantMutation,
} from "../../_shared";
import type { EvidenceMediaCategory, MediaItem } from "../../_shared";
import {
  EVIDENCE_IMAGE_MAX_BYTES,
  EVIDENCE_IMAGE_TYPES,
  EVIDENCE_PDF_MAX_BYTES,
  EVIDENCE_PDF_TYPE,
  deleteEvidenceMedia,
  fetchEvidenceMedia,
  fetchEvidenceMediaBlob,
  uploadEvidenceMedia,
} from "./evidenceMedia.api";

const CATEGORY_OPTIONS = toOptions(EVIDENCE_MEDIA_CATEGORY_LABELS);

/** Label for an evidence category (evidence never carries `profile_photo`). */
function categoryLabel(category: MediaItem["category"]): string {
  return (
    EVIDENCE_MEDIA_CATEGORY_LABELS[category as EvidenceMediaCategory] ??
    category
  );
}

function formatBytes(bytes: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Validate a picked evidence file (image ≤5 MB or PDF ≤10 MB). Returns an error or null. */
function validateFile(file: File): string | null {
  if (EVIDENCE_IMAGE_TYPES.includes(file.type)) {
    return file.size > EVIDENCE_IMAGE_MAX_BYTES
      ? "Images must be 5 MB or smaller."
      : null;
  }
  if (file.type === EVIDENCE_PDF_TYPE) {
    return file.size > EVIDENCE_PDF_MAX_BYTES
      ? "PDFs must be 10 MB or smaller."
      : null;
  }
  return "Use a JPEG, PNG, WEBP image or a PDF.";
}

/**
 * Evidence media for an applicant (§7): upload (image/PDF, client-validated), list, view
 * (streams the private bytes into a new tab), and soft-delete. Admin/superadmin only.
 */
export function EvidenceMediaSection({ applicantId }: { applicantId: string }) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [category, setCategory] = useState<string>("other");
  const invalidate = [mediaKeys.list(applicantId)];

  const query = useQuery({
    queryKey: mediaKeys.list(applicantId),
    queryFn: () =>
      fetchEvidenceMedia(applicantId, {
        page: 1,
        pageSize: 100,
        search: "",
        sort: [],
        filters: {},
      }),
    retry: false,
  });

  const upload = useApplicantMutation<MediaItem, File>({
    mutationFn: (file) => uploadEvidenceMedia(applicantId, category, file),
    successTitle: "File uploaded",
    successMessage: "The evidence file was stored.",
    errorTitle: "Couldn't upload file",
    invalidateKeys: invalidate,
    onSuccess: () => setUploadOpen(false),
  });

  const remove = useApplicantMutation<void, string>({
    mutationFn: (mediaId) => deleteEvidenceMedia(applicantId, mediaId),
    successTitle: "File removed",
    successMessage: "The evidence file was archived.",
    errorTitle: "Couldn't remove file",
    invalidateKeys: invalidate,
  });

  const handleFile = (file: File | null) => {
    if (!file) return;
    const error = validateFile(file);
    if (error) {
      notifications.show({
        color: "red",
        title: "Unsupported file",
        message: error,
      });
      return;
    }
    upload.mutate(file);
  };

  const handleView = async (media: MediaItem) => {
    try {
      const blob = await fetchEvidenceMediaBlob(applicantId, media.id);
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener");
      // Revoke after the new tab has had time to load the resource.
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Couldn't open file",
        message: getApiErrorMessage(error),
      });
    }
  };

  const confirmDelete = (media: MediaItem) =>
    modals.openConfirmModal({
      title: "Remove file",
      children: (
        <Text size="sm">
          Archive this {categoryLabel(media.category)}? The file is retained but
          hidden.
        </Text>
      ),
      labels: { confirm: "Remove", cancel: "Cancel" },
      confirmProps: { color: "red", size: "xs" },
      cancelProps: { size: "xs" },
      onConfirm: () => remove.mutate(media.id),
    });

  const rows = query.data?.data ?? [];

  return (
    <ModalPaper withBorder>
      <Stack gap="sm">
        <Group justify="space-between">
          <Title order={6}>Evidence media</Title>
          <Button
            size="xs"
            variant="default"
            leftSection={<UploadSimpleIcon size={14} />}
            onClick={() => setUploadOpen(true)}
          >
            Upload
          </Button>
        </Group>

        {query.isLoading ? (
          <Group justify="center" py="lg">
            <Loader size="sm" />
          </Group>
        ) : rows.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="lg">
            No evidence files yet.
          </Text>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Category</Table.Th>
                <Table.Th>File</Table.Th>
                <Table.Th>Size</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((media) => (
                <Table.Tr key={media.id}>
                  <Table.Td>
                    <Text size="xs">{categoryLabel(media.category)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs">
                      {media.original_filename || media.mime_type}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs">{formatBytes(media.size_bytes)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4} justify="flex-end">
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        aria-label="View file"
                        onClick={() => handleView(media)}
                      >
                        <EyeIcon size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        aria-label="Remove file"
                        onClick={() => confirmDelete(media)}
                      >
                        <TrashIcon size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Stack>

      <Modal
        opened={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Upload evidence"
        centered
      >
        <Stack gap="sm">
          <Select
            label="Category"
            data={CATEGORY_OPTIONS}
            value={category}
            onChange={(v) => setCategory(v ?? "other")}
          />
          <FileButton
            onChange={handleFile}
            accept={[...EVIDENCE_IMAGE_TYPES, EVIDENCE_PDF_TYPE].join(",")}
          >
            {(props) => (
              <Button
                {...props}
                leftSection={<UploadSimpleIcon size={14} />}
                loading={upload.isPending}
                fullWidth
              >
                Choose file
              </Button>
            )}
          </FileButton>
          <Text size="xs" c="dimmed">
            Image (JPEG/PNG/WEBP, ≤5 MB) or PDF (≤10 MB).
          </Text>
        </Stack>
      </Modal>
    </ModalPaper>
  );
}
