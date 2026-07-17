"use client";

import { useState } from "react";
import Cropper from "react-easy-crop";
import {
  Box,
  Button,
  Group,
  Modal,
  SegmentedControl,
  Slider,
  Stack,
  Text,
  notifications,
} from "@peppermint/ui";
import {
  getCroppedPngFile,
  type PixelArea,
} from "../../SignatureImageField.utils";
import type { SignatureCropModalProps } from "./SignatureCropModal.types";

const ASPECT_OPTIONS = [
  { label: "Wide 3:1", value: "3" },
  { label: "2:1", value: "2" },
  { label: "Square 1:1", value: "1" },
];

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

export function SignatureCropModal({
  opened,
  src,
  onConfirm,
  onClose,
}: SignatureCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [aspect, setAspect] = useState("3");
  const [area, setArea] = useState<PixelArea | null>(null);
  const [processing, setProcessing] = useState(false);

  const reset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(MIN_ZOOM);
    setAspect("3");
    setArea(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Switching aspect re-frames the crop; drop the stale pixel area until `onCropComplete`
  // re-fires so "Apply" can't draw the previous frame's region.
  const handleAspectChange = (value: string) => {
    setAspect(value);
    setArea(null);
  };

  const handleConfirm = async () => {
    if (!src || !area) return;
    setProcessing(true);
    try {
      const file = await getCroppedPngFile(src, area);
      reset();
      onConfirm(file);
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Couldn't crop the image",
        message:
          error instanceof Error ? error.message : "Please try another image.",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Crop signature"
      size="lg"
      zIndex={1000}
      centered
      closeOnEscape={!processing}
      closeOnClickOutside={!processing}
      withCloseButton={!processing}
    >
      <Stack gap="md" p="md">
        <Box pos="relative" h={320} bg="dark.8" style={{ borderRadius: 8 }}>
          {src ? (
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              aspect={Number(aspect)}
              minZoom={MIN_ZOOM}
              maxZoom={MAX_ZOOM}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, croppedAreaPixels) =>
                setArea(croppedAreaPixels)
              }
            />
          ) : null}
        </Box>

        <div>
          <Text size="sm" fw={500} mb={4}>
            Frame
          </Text>
          <SegmentedControl
            fullWidth
            data={ASPECT_OPTIONS}
            value={aspect}
            onChange={handleAspectChange}
            disabled={processing}
          />
        </div>

        <div>
          <Text size="sm" fw={500} mb={4}>
            Zoom
          </Text>
          <Slider
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.1}
            value={zoom}
            onChange={setZoom}
            label={(v) => `${v.toFixed(1)}×`}
            disabled={processing}
          />
        </div>

        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={handleClose} disabled={processing}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} loading={processing} disabled={!area}>
            Apply crop
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
