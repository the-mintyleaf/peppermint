import React from 'react';
import { Button, Group, Modal, Text } from '@zetsel/ui';
import { useInvalidateTable } from '../../../../wrappers/DataTableWrapper';
import { triggerNotification } from '../../../../notification';
import type { ApiResponse } from '@zetsel/api-client';

interface DeleteConfirmModalProps {
  opened: boolean;
  onClose: () => void;
  queryKey: string;
  ids: Array<string | number>;
  onDeleteApi: (id: string | number) => Promise<ApiResponse<void>>;
  onSuccess?: () => void;
}

export function DeleteConfirmModal({
  opened,
  onClose,
  queryKey,
  ids,
  onDeleteApi,
  onSuccess,
}: DeleteConfirmModalProps) {
  const invalidate = useInvalidateTable(queryKey);
  const [isLoading, setIsLoading] = React.useState(false);

  async function handleConfirm() {
    setIsLoading(true);
    try {
      const results = await Promise.all(ids.map((id) => onDeleteApi(id)));
      const failed = results.filter((r) => !r.ok);
      if (failed.length > 0) {
        triggerNotification.error(failed[0].message || 'Delete failed');
      } else {
        triggerNotification.success(`${ids.length} record(s) deleted`);
        invalidate();
        onSuccess?.();
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Confirm Delete" size="sm">
      <Text size="sm">
        Are you sure you want to delete {ids.length} record{ids.length !== 1 ? 's' : ''}? This cannot be undone.
      </Text>
      <Group justify="flex-end" mt="md" gap="sm">
        <Button variant="default" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button color="red" onClick={handleConfirm} loading={isLoading}>
          Delete
        </Button>
      </Group>
    </Modal>
  );
}
