"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Group,
  Image,
  Loader,
  Modal,
  Stack,
  Text,
} from "@peppermint/ui";
import { DownloadSimpleIcon } from "@phosphor-icons/react/dist/csr/DownloadSimple";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import { QueryErrorState } from "@/components/QueryErrorState";
import { saveBlobAs } from "../../downloadFile";
import {
  getFileBytesErrorMessage,
  isFileBytesMissing,
} from "../../fileBytesError";
import {
  formatFileSize,
  getFileViewKind,
  getViewerMimeType,
} from "../../../uploadedFiles.utils";
import { useFilePreview } from "./FilePreviewModal.hooks";
import type {
  FilePreviewModalProps,
  PreviewStageProps,
} from "./FilePreviewModal.types";
import classes from "./FilePreviewModal.module.css";

const STAGE_HEIGHT = "70vh";

/** The viewing area: loading → error (retry unless bytes are gone) → image/PDF. */
function PreviewStage({ name, kind, preview }: PreviewStageProps) {
  const [imageFailed, setImageFailed] = useState(false);

  if (preview.isError) {
    return isFileBytesMissing(preview.error) ? (
      <Alert
        color="red"
        icon={<WarningIcon size={18} weight="fill" aria-hidden />}
        title="This file could not be retrieved"
      >
        <Text size="sm">{getFileBytesErrorMessage(preview.error)}</Text>
      </Alert>
    ) : (
      <QueryErrorState
        message={`Couldn't load this file. ${getFileBytesErrorMessage(preview.error)}`}
        onRetry={preview.retry}
        isRetrying={preview.isRetrying}
      />
    );
  }

  if (!preview.url) {
    return (
      <Stack
        className={classes.stage}
        h={STAGE_HEIGHT}
        gap="xs"
        align="center"
        justify="center"
        role="status"
        aria-live="polite"
      >
        <Loader size="sm" />
        <Text size="xs" c="dimmed">
          Loading preview…
        </Text>
      </Stack>
    );
  }

  if (kind === "pdf") {
    return (
      <Box className={classes.stage} h={STAGE_HEIGHT}>
        <iframe
          className={classes.frame}
          src={preview.url}
          title={`Preview of ${name}`}
        />
      </Box>
    );
  }

  if (imageFailed) {
    return (
      <Alert
        color="yellow"
        icon={<WarningIcon size={18} aria-hidden />}
        title="This image can't be shown in the browser"
      >
        <Text size="sm">Use Download to open it on your device instead.</Text>
      </Alert>
    );
  }

  return (
    <Box className={classes.stage} h={STAGE_HEIGHT}>
      <Image
        src={preview.url}
        alt={name}
        fit="contain"
        w="100%"
        h="100%"
        onError={() => setImageFailed(true)}
      />
    </Box>
  );
}

/**
 * In-app viewer for images and PDFs. The bytes come from the authenticated,
 * audited download route (`useFilePreview`) — fetched when this mounts, i.e.
 * when the user clicks a file, never before. Images render fit-to-view; PDFs
 * render in an `<iframe>` over a blob URL typed `application/pdf`, so the
 * browser's own PDF viewer handles paging/zoom. Download re-uses the fetched
 * bytes rather than downloading again.
 *
 * The theme zeroes `Modal` body padding (`theme.mantine.components.tsx`), so
 * the content `Stack` carries `p="md"` itself.
 */
export function FilePreviewModal({
  file,
  opened,
  onClose,
  onExited,
}: FilePreviewModalProps) {
  const fileKind = getFileViewKind(file);
  const kind = fileKind === "pdf" ? "pdf" : "image";
  const preview = useFilePreview(file.id, getViewerMimeType(file, kind));
  const typeLabel = kind === "pdf" ? "PDF" : "Image";

  const handleDownload = () => {
    if (preview.blob) saveBlobAs(preview.blob, file.original_filename);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      onExitTransitionEnd={onExited}
      size="90%"
      centered
      classNames={{ title: classes.title }}
      title={
        <span title={file.original_filename}>{file.original_filename}</span>
      }
    >
      <Stack gap="md" p="md">
        <PreviewStage
          key={file.id}
          name={file.original_filename}
          kind={kind}
          preview={preview}
        />
        <Group justify="space-between" gap="sm" wrap="wrap">
          <Text size="xs" c="dimmed">
            {typeLabel} · {formatFileSize(file.size_bytes)} · v
            {file.version_number}
          </Text>
          <Group gap="xs">
            <Button size="xs" variant="default" onClick={onClose}>
              Close
            </Button>
            <Button
              size="xs"
              leftSection={<DownloadSimpleIcon size={14} aria-hidden />}
              disabled={!preview.blob}
              onClick={handleDownload}
            >
              Download
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}
