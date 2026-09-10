"use client";

import { useEffect, useState } from "react";
import { Box, Group, Image, Stack, Text } from "@peppermint/ui";
import { Dropzone } from "@peppermint/ui/dropzone";
import { UploadSimpleIcon } from "@phosphor-icons/react/dist/csr/UploadSimple";
import { XCircleIcon } from "@phosphor-icons/react/dist/csr/XCircle";
import { ImageIcon } from "@phosphor-icons/react/dist/csr/Image";
import {
  MAX_SIGNATURE_SIZE_BYTES,
  SIGNATURE_MIME_TYPES,
} from "../../../signatures.labels";

interface SignatureDropzoneProps {
  file: File | null;
  onPick: (file: File | null) => void;
  /** Validation message from the form schema, shown under the drop target. */
  error?: string;
  disabled?: boolean;
}

/**
 * Renders the picked file so the operator sees the actual image before it is
 * stored. This matters more here than for a normal attachment: the backend does
 * **no thumbnailing, no dimension check and no crop** — whatever is uploaded is
 * exactly what prints on every certificate — so the preview is the only chance
 * to catch a scan that is rotated, cropped wrong, or on a black background.
 *
 * The object URL is created in an effect rather than during render because it
 * allocates a real browser resource, and only an effect's cleanup is guaranteed
 * to run before the next one (React 19 StrictMode's double-invoke included).
 * Same reasoning as `uploaded-files`' `useFileBlob`.
 */
function useLocalPreview(file: File | null): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronizing a browser resource (object URL) with the picked file, not mirroring React state.
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  return url;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SignatureDropzone({
  file,
  onPick,
  error,
  disabled,
}: SignatureDropzoneProps) {
  const preview = useLocalPreview(file);

  return (
    <Stack gap={6}>
      <Dropzone
        onDrop={(files) => onPick(files[0] ?? null)}
        // Rejections are surfaced by clearing the selection rather than by a
        // second error channel — the form schema below already owns the
        // messaging, and two sources would disagree.
        onReject={() => onPick(null)}
        maxSize={MAX_SIGNATURE_SIZE_BYTES}
        accept={[...SIGNATURE_MIME_TYPES]}
        maxFiles={1}
        multiple={false}
        disabled={disabled}
        aria-label="Signature image drop area"
        styles={{
          root: {
            borderColor: error
              ? "var(--mantine-color-red-6)"
              : "var(--mantine-color-gray-4)",
            padding: "var(--mantine-spacing-sm)",
          },
        }}
      >
        {preview && file ? (
          <Group gap="sm" wrap="nowrap" style={{ pointerEvents: "none" }}>
            <Box
              p={4}
              style={{
                borderRadius: "var(--mantine-radius-sm)",
                background: "var(--mantine-color-body)",
                border: "1px solid var(--mantine-color-gray-3)",
              }}
            >
              <Image src={preview} alt="" h={48} w={110} fit="contain" />
            </Box>
            <Stack gap={0} style={{ minWidth: 0 }}>
              <Text size="xs" fw={500} truncate>
                {file.name}
              </Text>
              <Text size="xs" c="dimmed">
                {formatSize(file.size)} · this is exactly what will print
              </Text>
            </Stack>
          </Group>
        ) : (
          <Group
            gap="sm"
            wrap="nowrap"
            justify="center"
            style={{ pointerEvents: "none" }}
          >
            <Dropzone.Accept>
              <UploadSimpleIcon
                size={22}
                color="var(--mantine-color-brand-6)"
                aria-hidden
              />
            </Dropzone.Accept>
            <Dropzone.Reject>
              <XCircleIcon
                size={22}
                color="var(--mantine-color-red-6)"
                aria-hidden
              />
            </Dropzone.Reject>
            <Dropzone.Idle>
              <ImageIcon
                size={22}
                color="var(--mantine-color-dimmed)"
                aria-hidden
              />
            </Dropzone.Idle>
            <Stack gap={0}>
              <Text size="xs" fw={500}>
                Drop a signature image, or click to choose
              </Text>
              <Text size="xs" c="dimmed">
                PNG, JPG, JPEG or WEBP — max 10 MB
              </Text>
            </Stack>
          </Group>
        )}
      </Dropzone>
      {error ? (
        <Text size="xs" c="red.7" role="alert">
          {error}
        </Text>
      ) : null}
    </Stack>
  );
}
