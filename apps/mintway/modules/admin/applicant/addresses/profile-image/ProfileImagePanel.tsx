"use client";

import { useRef } from "react";
import {
  Avatar,
  Button,
  FileButton,
  Group,
  Loader,
  ModalPaper,
  Stack,
  Text,
  Title,
  notifications,
} from "@peppermint/ui";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { UploadSimpleIcon } from "@phosphor-icons/react/dist/csr/UploadSimple";

import { profileImageKeys, useApplicantMutation } from "../../_shared";
import {
  PROFILE_IMAGE_MAX_BYTES,
  PROFILE_IMAGE_TYPES,
  uploadProfileImage,
} from "./profileImage.api";
import { useProfileImageUrl } from "./useProfileImageUrl";

interface ProfileImagePanelProps {
  applicantId: string;
  /** Disable upload (locked record staff can't edit / archived). */
  disabled?: boolean;
}

/**
 * Shows and replaces the applicant's private profile photo. The image is streamed as a
 * Blob and rendered via an object URL (revoked on change); uploads are client-validated
 * for type/size before the multipart POST, with the server as the final authority.
 */
export function ProfileImagePanel({
  applicantId,
  disabled,
}: ProfileImagePanelProps) {
  const { url, isLoading } = useProfileImageUrl(applicantId);

  const resetFileRef = useRef<() => void>(null);

  const upload = useApplicantMutation<unknown, File>({
    mutationFn: (file) => uploadProfileImage(applicantId, file),
    successTitle: "Photo updated",
    successMessage: "The profile photo was replaced.",
    errorTitle: "Couldn't upload photo",
    invalidateKeys: [profileImageKeys.detail(applicantId)],
  });

  const handleFile = (file: File | null) => {
    // Reset the input so picking the SAME file again (e.g. after a failed upload)
    // still fires onChange.
    resetFileRef.current?.();
    if (!file) return;
    if (!PROFILE_IMAGE_TYPES.includes(file.type)) {
      notifications.show({
        color: "red",
        title: "Unsupported file",
        message: "Use a JPEG, PNG, or WEBP image.",
      });
      return;
    }
    if (file.size > PROFILE_IMAGE_MAX_BYTES) {
      notifications.show({
        color: "red",
        title: "File too large",
        message: "The image must be 5 MB or smaller.",
      });
      return;
    }
    upload.mutate(file);
  };

  return (
    <ModalPaper withBorder>
      <Stack gap="sm">
        <Title order={6}>Profile photo</Title>
        <Group>
          {isLoading ? (
            <Loader size="sm" />
          ) : (
            <Avatar src={url} size={96} radius="md">
              <UserIcon size={40} aria-hidden />
            </Avatar>
          )}
          <Stack gap={4}>
            <FileButton
              onChange={handleFile}
              accept={PROFILE_IMAGE_TYPES.join(",")}
              resetRef={resetFileRef}
            >
              {(props) => (
                <Button
                  {...props}
                  size="xs"
                  variant="default"
                  leftSection={<UploadSimpleIcon size={14} />}
                  loading={upload.isPending}
                  disabled={disabled}
                >
                  {url ? "Replace photo" : "Upload photo"}
                </Button>
              )}
            </FileButton>
            <Text size="xs" c="dimmed">
              JPEG, PNG, or WEBP · up to 5 MB
            </Text>
          </Stack>
        </Group>
      </Stack>
    </ModalPaper>
  );
}
