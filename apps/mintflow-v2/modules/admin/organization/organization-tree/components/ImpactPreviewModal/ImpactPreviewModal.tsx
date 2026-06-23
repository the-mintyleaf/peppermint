"use client";

import { Button, Group, Modal, Stack, Text, ThemeIcon } from "@peppermint/ui";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";

interface ImpactPreviewModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  nodeName: string;
  nodeType: string;
  affectedPeople: number;
  affectedDepts: number;
}

export function ImpactPreviewModal({
  opened,
  onClose,
  onConfirm,
  nodeName,
  nodeType,
  affectedPeople,
  affectedDepts,
}: ImpactPreviewModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <ThemeIcon size="sm" color="red" variant="light">
            <WarningIcon size={14} aria-label="Warning" />
          </ThemeIcon>
          <Text fw={600} size="sm">Confirm Deletion</Text>
        </Group>
      }
      size="sm"
      centered
    >
      <Stack gap="md">
        <Text size="sm">
          You are about to delete <Text span fw={700}>{nodeName}</Text> ({nodeType}).
        </Text>

        {(affectedPeople > 0 || affectedDepts > 0) && (
          <Stack gap={6} style={{ background: "var(--mantine-color-red-0)", borderRadius: 8, padding: "10px 12px" }}>
            <Text size="xs" fw={600} c="red">This will also affect:</Text>
            {affectedPeople > 0 && (
              <Text size="xs" c="dimmed">• {affectedPeople} people in this branch</Text>
            )}
            {affectedDepts > 0 && (
              <Text size="xs" c="dimmed">• {affectedDepts} departments / units</Text>
            )}
            <Text size="xs" c="dimmed">• All reporting relationships and edges in this branch</Text>
          </Stack>
        )}

        <Text size="xs" c="dimmed">
          This action cannot be undone. However, you can undo via the undo button after confirming.
        </Text>

        <Group gap={8} justify="flex-end">
          <Button size="xs" variant="subtle" color="gray" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="xs"
            color="red"
            leftSection={<TrashIcon size={13} aria-label="Delete" />}
            onClick={() => { onConfirm(); onClose(); }}
          >
            Delete
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
