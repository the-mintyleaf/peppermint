"use client";

import { Modal, Stack, Textarea, Button, Group, Text } from "@peppermint/ui";
import { useState } from "react";

interface RejectModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: (notes: string) => void;
  loading?: boolean;
}

export function RejectModal({ opened, onClose, onConfirm, loading }: RejectModalProps) {
  const [notes, setNotes] = useState("");

  function handleConfirm() {
    if (!notes.trim()) return;
    onConfirm(notes.trim());
    setNotes("");
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Reject Content" size="sm">
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Provide a reason for rejection. This will be visible to the content creator.
        </Text>
        <Textarea
          label="Notes"
          placeholder="Explain why this content is being rejected…"
          value={notes}
          onChange={(e) => setNotes(e.currentTarget.value)}
          required
          autosize
          minRows={3}
        />
        <Group justify="flex-end">
          <Button variant="subtle" onClick={onClose}>Cancel</Button>
          <Button
            color="red"
            disabled={!notes.trim()}
            loading={loading}
            onClick={handleConfirm}
          >
            Reject
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
