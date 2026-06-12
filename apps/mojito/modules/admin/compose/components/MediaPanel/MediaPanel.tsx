"use client";

import {
  Stack,
  Text,
  Group,
  Image,
  ActionIcon,
  Paper,
  FileButton,
  Button,
  SimpleGrid,
} from "@zetsel/ui";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { UploadSimpleIcon } from "@phosphor-icons/react/dist/csr/UploadSimple";
import { useComposeStore } from "../../compose.store";
import { v4 as uuidv4 } from "uuid";
import type { MediaRef } from "@/modules/admin/shared/domain.types";

export function MediaPanel() {
  const { draft, addMedia, removeMedia } = useComposeStore();
  const { mediaRefs } = draft;

  function handleFileSelect(file: File | null) {
    if (!file) return;

    const url = URL.createObjectURL(file);
    const ref: MediaRef = {
      id: uuidv4(),
      url,
      kind: file.type.startsWith("video/") ? "video" : "image",
      alt: file.name,
    };
    addMedia(ref);
  }

  return (
    <Stack gap="sm">
      <Group justify="space-between">
        <Text size="sm" fw={500}>
          Media
        </Text>
        <FileButton onChange={handleFileSelect} accept="image/*,video/*">
          {(props) => (
            <Button
              {...props}
              size="xs"
              variant="light"
              leftSection={<UploadSimpleIcon size={14} />}
            >
              Upload
            </Button>
          )}
        </FileButton>
      </Group>

      {mediaRefs.length === 0 ? (
        <Paper p="md" withBorder radius="sm" style={{ borderStyle: "dashed" }}>
          <FileButton onChange={handleFileSelect} accept="image/*,video/*">
            {(props) => (
              <Stack gap="xs" align="center" style={{ cursor: "pointer" }} {...props}>
                <UploadSimpleIcon size={24} />
                <Text size="sm" c="dimmed">
                  Drag & drop or click to upload
                </Text>
                <Text size="xs" c="dimmed">
                  Images and videos supported
                </Text>
              </Stack>
            )}
          </FileButton>
        </Paper>
      ) : (
        <SimpleGrid cols={3} spacing="xs">
          {mediaRefs.map((ref) => (
            <Paper key={ref.id} pos="relative" radius="sm" style={{ overflow: "hidden" }}>
              <Image
                src={ref.url}
                alt={ref.alt}
                h={80}
                fit="cover"
                radius="sm"
              />
              <ActionIcon
                size="xs"
                color="red"
                variant="filled"
                pos="absolute"
                top={4}
                right={4}
                onClick={() => removeMedia(ref.id)}
                aria-label="Remove media"
              >
                <XIcon size={10} />
              </ActionIcon>
            </Paper>
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
}
