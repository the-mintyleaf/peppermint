"use client";

import { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  FileButton,
  Group,
  Skeleton,
  Stack,
  Text,
} from "@peppermint/ui";
import { UploadSimpleIcon } from "@phosphor-icons/react/dist/csr/UploadSimple";
import { MAX_FILE_SIZE_BYTES } from "@/modules/admin/uploaded-files/uploadedFiles.utils";
import {
  useApplicantPhotograph,
  useSaveApplicantPhotograph,
} from "../applicantPhotograph.hooks";
import {
  PHOTO_FILE_INPUT_ACCEPT,
  PHOTO_TYPE_ERROR,
  applicantInitials,
  hasPhotoExtension,
} from "../applicantPhotograph.utils";
import type { ApplicantPhotoFieldProps } from "./ApplicantPhotoField.types";

/** Same two rules the backend enforces, checked here so a bad pick fails
 * instantly instead of after a 10 MB round trip. Empty is its own message
 * because the backend gives it its own code — a zero-byte file is not a
 * too-large one (`uploaded-files/INTEGRATION.md` §7). */
function validatePhoto(file: File): string | null {
  if (file.size === 0) return "This file is empty";
  if (file.size > MAX_FILE_SIZE_BYTES) return "Photo must be 10 MB or smaller";
  if (!hasPhotoExtension(file.name)) return PHOTO_TYPE_ERROR;
  return null;
}

/** Object URL for a locally-picked file, revoked on replacement/unmount.
 * An effect rather than `useMemo` for the same reason `useFileBlob` gives:
 * only an effect's cleanup is guaranteed to run before the next one. */
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

/**
 * Answers one question: **what picture does this person carry, and how do I
 * change it?**
 *
 * The applicant record itself has no photo field — this reads and writes an
 * `uploaded_files` row (`category=photograph`). A change is always a *replace*
 * when one already exists, so there is exactly one current photograph and the
 * predecessor stays in the version chain: nothing here destroys a file, and the
 * Files tab can still reach every earlier one.
 */
export function ApplicantPhotoField({
  applicantId,
  name,
  mode,
  value = null,
  onChange,
  error,
  disabled = false,
  hideLabel = false,
}: ApplicantPhotoFieldProps) {
  const photograph = useApplicantPhotograph(applicantId);
  const save = useSaveApplicantPhotograph(
    applicantId,
    photograph.file?.id ?? null,
  );
  const [localError, setLocalError] = useState<string | null>(null);

  const stagedPreview = useLocalPreview(value);
  const previewUrl = stagedPreview ?? photograph.url;
  const shownError = error ?? localError;

  const handlePick = (file: File | null) => {
    setLocalError(null);
    if (!file) {
      onChange?.(null);
      return;
    }
    const message = validatePhoto(file);
    if (message) {
      setLocalError(message);
      return;
    }
    if (mode === "deferred") {
      onChange?.(file);
      return;
    }
    // `useSaveApplicantPhotograph` (useAppMutation) shows both the success and
    // the failure notification; a rejection here needs no second report.
    save.mutate(file);
  };

  const isBusy = save.isPending;
  const isLocked = disabled || isBusy;

  return (
    <Stack gap={6}>
      {hideLabel ? null : (
        <Text size="sm" fw={500}>
          Photograph
        </Text>
      )}

      <Group gap="md" align="center" wrap="nowrap">
        {photograph.isLoading && !stagedPreview ? (
          <Skeleton height={72} width={72} circle />
        ) : (
          <Avatar
            src={previewUrl}
            alt={previewUrl ? `Photograph of ${name}` : undefined}
            size={72}
            radius="md"
            color="blue"
          >
            {applicantInitials(name)}
          </Avatar>
        )}

        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
          <Group gap="xs" wrap="nowrap">
            <FileButton
              onChange={handlePick}
              accept={PHOTO_FILE_INPUT_ACCEPT}
              // Remounting on each committed file lets the same file be picked
              // twice in a row (e.g. after a failed upload) — the input keeps
              // its previous value otherwise and fires no change event.
              key={photograph.file?.id ?? value?.name ?? "empty"}
            >
              {(props) => (
                <Button
                  {...props}
                  size="xs"
                  variant="default"
                  loading={isBusy}
                  disabled={isLocked}
                  leftSection={<UploadSimpleIcon size={14} aria-hidden />}
                >
                  {previewUrl ? "Change photo" : "Add photo"}
                </Button>
              )}
            </FileButton>

            {value && mode === "deferred" ? (
              <Button
                size="xs"
                variant="subtle"
                color="gray"
                disabled={isLocked}
                onClick={() => {
                  setLocalError(null);
                  onChange?.(null);
                }}
              >
                Undo
              </Button>
            ) : null}
          </Group>

          {/* One line, and only one — whichever state is actually true. Ordered
           * by what the operator can act on: a validation error first, then a
           * failed load (retryable), then a staged change, then the plain facts. */}
          {shownError ? (
            <Text size="xs" c="red">
              {shownError}
            </Text>
          ) : photograph.isError ? (
            <Group gap="xs">
              <Text size="xs" c="red">
                Couldn&apos;t load the current photograph.
              </Text>
              <Button
                size="compact-xs"
                variant="subtle"
                onClick={() => photograph.refetch()}
              >
                Try again
              </Button>
            </Group>
          ) : value ? (
            <Text size="xs" c="dimmed">
              {value.name} — replaces the current photograph when you save.
            </Text>
          ) : photograph.isMissing ? (
            <Text size="xs" c="dimmed">
              No photograph on file. JPG, PNG or WEBP, up to 10 MB.
            </Text>
          ) : (
            <Text size="xs" c="dimmed">
              JPG, PNG or WEBP, up to 10 MB. The photo it replaces stays in the
              file history.
            </Text>
          )}
        </Stack>
      </Group>
    </Stack>
  );
}
