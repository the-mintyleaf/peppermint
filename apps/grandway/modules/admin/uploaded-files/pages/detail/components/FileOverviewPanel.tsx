"use client";

import { SimpleGrid, Stack, Text } from "@peppermint/ui";
import {
  FILE_CATEGORY_LABELS,
  UPLOAD_SOURCE_LABELS,
} from "../../../uploadedFiles.labels";
import { formatDateTime, formatFileSize } from "../../../uploadedFiles.utils";
import type { UploadedFile } from "../../../uploadedFiles.types";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Stack gap={2}>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text size="sm">{value}</Text>
    </Stack>
  );
}

/**
 * All metadata fields from the read shape (§4) — never bytes, never a storage
 * path (§3). Conditionally shows rejection/archive/superseded fields only
 * when relevant, rather than a wall of empty dashes.
 */
export function FileOverviewPanel({ file }: { file: UploadedFile }) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
      <Field label="Category" value={FILE_CATEGORY_LABELS[file.category]} />
      <Field label="Content type" value={file.content_type} />
      <Field label="Size" value={formatFileSize(file.size_bytes)} />
      <Field label="Checksum (SHA-256)" value={file.checksum_sha256} />
      <Field
        label="Upload source"
        value={UPLOAD_SOURCE_LABELS[file.upload_source] ?? file.upload_source}
      />
      <Field label="Uploaded by" value={file.uploaded_by_username} />
      <Field label="Uploaded at" value={formatDateTime(file.created_at)} />
      <Field label="Last updated" value={formatDateTime(file.updated_at)} />
      <Field label="Reviewed by" value={file.reviewed_by_username || "—"} />
      <Field label="Reviewed at" value={formatDateTime(file.reviewed_at)} />
      {file.verification_status === "rejected" ? (
        <Field label="Rejection reason" value={file.rejection_reason || "—"} />
      ) : null}
      {file.is_archived ? (
        <>
          <Field label="Archived by" value={file.archived_by_username || "—"} />
          <Field label="Archived at" value={formatDateTime(file.archived_at)} />
          <Field label="Archive reason" value={file.archive_reason || "—"} />
        </>
      ) : null}
      {!file.is_current ? (
        <Field
          label="Superseded by"
          value={file.superseded_by_username || "—"}
        />
      ) : null}
      {file.notes ? <Field label="Notes" value={file.notes} /> : null}
    </SimpleGrid>
  );
}
