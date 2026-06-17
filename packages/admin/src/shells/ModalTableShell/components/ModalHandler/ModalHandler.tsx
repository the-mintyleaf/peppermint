'use client';

import { useCallback } from 'react';
import { Modal, Loader, Center, notifications } from '@peppermint/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useModalTableShellContext } from '../../ModalTableShell.context';
import type { ModalHandlerProps } from '../../ModalTableShell.types';

export function ModalHandler<T extends Record<string, unknown>>({
  queryKey,
  moduleInfo,
  modalWidth = 'md',
  createModalTitle,
  editModalTitle,
  createFormComponent: CreateFormComponent,
  editFormComponent: EditFormComponent,
  onCreateApi,
  onEditApi,
  transformOnCreate,
  transformOnEdit,
  onCreateSuccess,
  onEditSuccess,
}: ModalHandlerProps<T>) {
  const queryClient = useQueryClient();

  const {
    isCreateModalOpen,
    isEditModalOpen,
    activeEditRecord,
    editLoading,
    closeCreateModal,
    closeEditModal,
    setActiveEditRecord,
  } = useModalTableShellContext<T>();

  const invalidate = useCallback(() => {
    const normalizedKey = typeof queryKey === 'string' ? queryKey.split('.') : queryKey;
    void queryClient.invalidateQueries({
      queryKey: normalizedKey,
    });
  }, [queryClient, queryKey]);

  const createMutation = useMutation({
    mutationFn: async (values: T) => {
      if (!onCreateApi) return;
      const payload = transformOnCreate ? transformOnCreate(values) : values;
      return onCreateApi(payload as T);
    },
    onSuccess: (result) => {
      notifications.show({
        color: 'green',
        title: 'Created',
        message: `${moduleInfo.label ?? moduleInfo.name} created successfully.`,
      });
      closeCreateModal();
      invalidate();
      onCreateSuccess?.(result);
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: 'Error',
        message: `Failed to create ${moduleInfo.label ?? moduleInfo.name}.`,
      });
    },
  });

  const editMutation = useMutation({
    mutationFn: async (values: T) => {
      if (!onEditApi || !activeEditRecord) return;
      const payload = transformOnEdit
        ? transformOnEdit(values, activeEditRecord)
        : values;
      return onEditApi(payload as T, activeEditRecord);
    },
    onSuccess: (result) => {
      notifications.show({
        color: 'green',
        title: 'Updated',
        message: `${moduleInfo.label ?? moduleInfo.name} updated successfully.`,
      });
      closeEditModal();
      setActiveEditRecord(null);
      invalidate();
      onEditSuccess?.(result);
    },
    onError: () => {
      notifications.show({
        color: 'red',
        title: 'Error',
        message: `Failed to update ${moduleInfo.label ?? moduleInfo.name}.`,
      });
    },
  });

  const handleEditModalClose = useCallback(() => {
    closeEditModal();
    setActiveEditRecord(null);
  }, [closeEditModal, setActiveEditRecord]);

  return (
    <>
      <Modal
        opened={isCreateModalOpen}
        onClose={closeCreateModal}
        title={createModalTitle ?? `New ${moduleInfo.name}`}
        size={modalWidth}
        centered
      >
        {CreateFormComponent && (
          <CreateFormComponent
            onSubmit={createMutation.mutate}
            isLoading={createMutation.isPending}
          />
        )}
      </Modal>

      <Modal
        opened={isEditModalOpen}
        onClose={handleEditModalClose}
        title={editModalTitle ?? `Edit ${moduleInfo.name}`}
        size={modalWidth}
        centered
      >
        {editLoading ? (
          <Center py="xl">
            <Loader size="sm" />
          </Center>
        ) : (
          EditFormComponent && activeEditRecord && (
            <EditFormComponent
              initialValues={activeEditRecord}
              onSubmit={editMutation.mutate}
              isLoading={editMutation.isPending}
            />
          )
        )}
      </Modal>
    </>
  );
}
