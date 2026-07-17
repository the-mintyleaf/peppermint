"use client";

import { useEffect, useState } from "react";
import { Dropzone } from "@peppermint/ui/dropzone";
import { ActionIcon, Group, Image, Input, Stack, Text } from "@peppermint/ui";
import { useFormInstance } from "@peppermint/admin";
import { CropIcon } from "@phosphor-icons/react/dist/csr/Crop";
import { ImageIcon } from "@phosphor-icons/react/dist/csr/Image";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { UploadSimpleIcon } from "@phosphor-icons/react/dist/csr/UploadSimple";
import { XCircleIcon } from "@phosphor-icons/react/dist/csr/XCircle";
import type { SignatureFormValues } from "../SignatureForm.types";
import { SignatureCropModal } from "./components/SignatureCropModal";
import { revokeUrl } from "./SignatureImageField.utils";
import type { SignatureImageFieldProps } from "./SignatureImageField.types";
import classes from "./SignatureImageField.module.css";

const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export function SignatureImageField({
  disabled = false,
  existingImageUrl,
  hasExistingImage,
}: SignatureImageFieldProps) {
  const { form } = useFormInstance<SignatureFormValues>();

  // `sourceUrl` — the original upload, kept so the crop can be re-adjusted.
  // `previewUrl` — the cropped PNG currently held in the form field.
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);

  // Revoke the previous object URL whenever it changes and on unmount (avoids leaks).
  useEffect(() => () => revokeUrl(sourceUrl), [sourceUrl]);
  useEffect(() => () => revokeUrl(previewUrl), [previewUrl]);

  const handleDrop = (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setSourceUrl(URL.createObjectURL(file));
    setCropOpen(true);
  };

  const handleConfirm = (file: File) => {
    form.setFieldValue("imageFile", file);
    setPreviewUrl(URL.createObjectURL(file));
    setCropOpen(false);
  };

  const handleCancelCrop = () => {
    setCropOpen(false);
    // Cancelling the very first crop discards the pending upload entirely.
    if (!previewUrl) setSourceUrl(null);
  };

  const handleRemove = () => {
    form.setFieldValue("imageFile", null);
    setPreviewUrl(null);
    setSourceUrl(null);
  };

  const showExisting = !previewUrl && hasExistingImage;

  return (
    <Input.Wrapper
      label="Signature image"
      description="Drop an image, then crop it. Oversized uploads are downscaled automatically."
    >
      <Stack gap="xs" mt={4}>
        {previewUrl ? (
          <Group align="center" gap="md" wrap="nowrap">
            <Image
              src={previewUrl}
              alt="Cropped signature preview"
              className={classes.preview}
            />
            <Group gap="xs">
              <ActionIcon
                variant="light"
                aria-label="Re-crop image"
                onClick={() => setCropOpen(true)}
                disabled={disabled || !sourceUrl}
              >
                <CropIcon size={16} aria-hidden />
              </ActionIcon>
              <ActionIcon
                variant="light"
                color="red"
                aria-label="Remove image"
                onClick={handleRemove}
                disabled={disabled}
              >
                <TrashIcon size={16} aria-hidden />
              </ActionIcon>
            </Group>
          </Group>
        ) : (
          <>
            {showExisting ? (
              <Group align="center" gap="md" wrap="nowrap">
                {existingImageUrl ? (
                  <Image
                    src={existingImageUrl}
                    alt="Current signature"
                    className={classes.preview}
                  />
                ) : null}
                <Text size="xs" c="dimmed">
                  Current image on file — drop a new one below to replace it.
                </Text>
              </Group>
            ) : null}
            <Dropzone
              onDrop={handleDrop}
              accept={ACCEPTED}
              maxSize={MAX_SIZE}
              multiple={false}
              disabled={disabled}
              className={classes.dropzone}
            >
              <Group
                justify="center"
                gap="md"
                wrap="nowrap"
                style={{ pointerEvents: "none" }}
              >
                <Dropzone.Accept>
                  <UploadSimpleIcon size={32} aria-hidden />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <XCircleIcon
                    size={32}
                    color="var(--mantine-color-red-6)"
                    aria-hidden
                  />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <ImageIcon size={32} aria-hidden />
                </Dropzone.Idle>
                <div>
                  <Text size="sm">Drag an image here or click to select</Text>
                  <Text size="xs" c="dimmed">
                    PNG, JPEG or WebP · up to 5 MB
                  </Text>
                </div>
              </Group>
            </Dropzone>
          </>
        )}
      </Stack>

      <SignatureCropModal
        opened={cropOpen}
        src={sourceUrl}
        onConfirm={handleConfirm}
        onClose={handleCancelCrop}
      />
    </Input.Wrapper>
  );
}
