"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Center,
  Group,
  Image,
  Loader,
  Paper,
  Stack,
  Text,
  ThemeIcon,
} from "@peppermint/ui";
import { FileIcon } from "@phosphor-icons/react/dist/csr/File";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { QueryErrorState } from "@/components/QueryErrorState";
import { EditFileModal } from "../components/EditFileModal";
import { FileRowActionsMenu } from "../components/FileRowActionsMenu";
import { ReplaceFileModal } from "../components/ReplaceFileModal";
import { UploadFileModal } from "../components/UploadFileModal";
import { VerifyFileModal } from "../components/VerifyFileModal";
import { useFileBlob } from "../useFileBlob";
import { useFilesList } from "../../uploadedFiles.hooks";
import {
  FILE_CATEGORY_LABELS,
  VERIFICATION_STATUS_COLORS,
  VERIFICATION_STATUS_LABELS,
} from "../../uploadedFiles.labels";
import type { UploadedFile } from "../../uploadedFiles.types";
import {
  PREVIEWABLE_CATEGORIES,
  formatFileSize,
} from "../../uploadedFiles.utils";
import type { FilesPanelProps } from "./FilesPanel.types";

/**
 * The reusable "files for this record" panel — every applicant/journey/offer
 * screen mounts this against its own `scope`, backed by the same one ledger
 * (`GET /files/?<owner>=<id>&is_archived=false`, §7/§CONCEPT). Document- and
 * snapshot-owned embeds are Admin-only in every respect (§1) — gating that is
 * the CALLER's responsibility (only mount this inside an admin-gated screen
 * for those owners); this panel itself only gates its own admin-only row
 * actions (Verify/Archive/Restore).
 */
export function FilesPanel({ scope }: FilesPanelProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [replaceFor, setReplaceFor] = useState<UploadedFile | null>(null);
  const [editFor, setEditFor] = useState<UploadedFile | null>(null);
  const [verifyFor, setVerifyFor] = useState<UploadedFile | null>(null);

  const { data, isLoading, isError, isRefetching, refetch } =
    useFilesList(scope);
  const files = data?.data ?? [];

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="center">
        <Text size="sm" fw={500}>
          Files
        </Text>
        <Button
          size="xs"
          variant="light"
          leftSection={<PlusIcon size={14} aria-hidden />}
          onClick={() => setUploadOpen(true)}
        >
          Upload file
        </Button>
      </Group>

      {isLoading ? (
        <Center py="md">
          <Loader size="sm" />
        </Center>
      ) : isError ? (
        <QueryErrorState
          message="Couldn't load files."
          onRetry={() => refetch()}
          isRetrying={isRefetching}
        />
      ) : files.length === 0 ? (
        <Text size="xs" c="dimmed">
          No files yet.
        </Text>
      ) : (
        <Stack gap="xs">
          {files.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              onReplace={setReplaceFor}
              onEdit={setEditFor}
              onVerify={setVerifyFor}
            />
          ))}
        </Stack>
      )}

      <UploadFileModal
        scope={scope}
        opened={uploadOpen}
        onClose={() => setUploadOpen(false)}
      />
      {replaceFor ? (
        <ReplaceFileModal
          file={replaceFor}
          opened={replaceFor !== null}
          onClose={() => setReplaceFor(null)}
        />
      ) : null}
      {editFor ? (
        <EditFileModal
          file={editFor}
          opened={editFor !== null}
          onClose={() => setEditFor(null)}
        />
      ) : null}
      {verifyFor ? (
        <VerifyFileModal
          file={verifyFor}
          opened={verifyFor !== null}
          onClose={() => setVerifyFor(null)}
        />
      ) : null}
    </Stack>
  );
}

interface FileCardProps {
  file: UploadedFile;
  onReplace: (file: UploadedFile) => void;
  onEdit: (file: UploadedFile) => void;
  onVerify: (file: UploadedFile) => void;
}

/**
 * One card per file — filename, category + verification badges, version
 * count. A thumbnail preview only for the two image categories (§9 — no
 * preview endpoint anywhere; `useFileBlob` fetches the bytes and builds an
 * object URL). `Image` here renders a blob: URL, not a static asset, so
 * `next/image` (which needs a resolvable remote/local path) doesn't apply —
 * same reasoning as `ClientForm`'s external-logo `Avatar`.
 */
function FileCard({ file, onReplace, onEdit, onVerify }: FileCardProps) {
  const previewable = PREVIEWABLE_CATEGORIES.has(file.category);
  const { url: previewUrl } = useFileBlob(file.id, previewable);

  return (
    <Paper withBorder p="sm" radius="sm">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
          {previewable && previewUrl ? (
            <Image
              src={previewUrl}
              alt={file.original_filename}
              w={40}
              h={40}
              radius="sm"
              fit="cover"
            />
          ) : (
            <ThemeIcon variant="light" size={40} radius="sm" color="gray">
              <FileIcon size={20} aria-hidden />
            </ThemeIcon>
          )}
          <Stack gap={2} style={{ minWidth: 0, flex: 1 }}>
            <Text size="xs" fw={500} truncate>
              {file.original_filename}
            </Text>
            <Group gap={4}>
              <Badge size="xs" variant="light" color="gray">
                {FILE_CATEGORY_LABELS[file.category]}
              </Badge>
              <Badge
                size="xs"
                color={VERIFICATION_STATUS_COLORS[file.verification_status]}
              >
                {VERIFICATION_STATUS_LABELS[file.verification_status]}
              </Badge>
              {file.is_archived ? (
                <Badge size="xs" color="gray" variant="outline">
                  Archived
                </Badge>
              ) : null}
              {!file.is_current ? (
                <Badge size="xs" color="gray" variant="outline">
                  Superseded
                </Badge>
              ) : null}
            </Group>
            <Text size="xs" c="dimmed">
              v{file.version_number} · {formatFileSize(file.size_bytes)}
            </Text>
          </Stack>
        </Group>
        <FileRowActionsMenu
          file={file}
          onReplace={onReplace}
          onEdit={onEdit}
          onVerify={onVerify}
        />
      </Group>
    </Paper>
  );
}
