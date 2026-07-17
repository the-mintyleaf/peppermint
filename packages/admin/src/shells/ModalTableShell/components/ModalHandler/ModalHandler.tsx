"use client";

import { useCallback } from "react";
import { Box, Modal, Loader, Center, notifications } from "@peppermint/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useModalTableShellContext } from "../../ModalTableShell.context";
import { ShellModalHeader } from "../ShellModalHeader";
import type { ModalHandlerProps } from "../../ModalTableShell.types";

const MODAL_BODY_PADDING = 0;

export function ModalHandler<
  TRow extends object,
  TCreate = TRow,
  TEdit = TCreate,
>({
  queryKey,
  moduleInfo,
  modalWidth = "lg",
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
  getErrorMessage,
}: ModalHandlerProps<TRow, TCreate, TEdit>) {
  const queryClient = useQueryClient();

  const {
    isCreateModalOpen,
    isEditModalOpen,
    activeEditRecord,
    editLoading,
    closeCreateModal,
    closeEditModal,
    setActiveEditRecord,
  } = useModalTableShellContext<TRow>();

  const moduleLabel = moduleInfo.label ?? moduleInfo.name;
  const createLabel = createModalTitle ?? `New ${moduleInfo.name}`;
  const editLabel = editModalTitle ?? `Edit ${moduleInfo.name}`;

  const invalidate = useCallback(() => {
    const normalizedKey =
      typeof queryKey === "string" ? queryKey.split(".") : queryKey;
    void queryClient.invalidateQueries({
      queryKey: normalizedKey,
    });
  }, [queryClient, queryKey]);

  const createMutation = useMutation({
    mutationFn: async (values: TCreate) => {
      if (!onCreateApi) return;
      const payload = transformOnCreate ? transformOnCreate(values) : values;
      return onCreateApi(payload);
    },
    onSuccess: (result) => {
      notifications.show({
        color: "green",
        title: "Created",
        message: `${moduleLabel} created successfully.`,
      });
      closeCreateModal();
      invalidate();
      onCreateSuccess?.(result);
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Error",
        message: getErrorMessage
          ? getErrorMessage(error)
          : `Failed to create ${moduleLabel}.`,
      });
    },
  });

  const editMutation = useMutation({
    mutationFn: async (values: TEdit) => {
      if (!onEditApi || !activeEditRecord) return;
      const payload = transformOnEdit
        ? transformOnEdit(values, activeEditRecord)
        : values;
      return onEditApi(payload, activeEditRecord);
    },
    onSuccess: (result) => {
      notifications.show({
        color: "green",
        title: "Updated",
        message: `${moduleLabel} updated successfully.`,
      });
      closeEditModal();
      setActiveEditRecord(null);
      invalidate();
      onEditSuccess?.(result);
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Error",
        message: getErrorMessage
          ? getErrorMessage(error)
          : `Failed to update ${moduleLabel}.`,
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
        size={modalWidth}
        centered
        padding={0}
        withCloseButton={false}
      >
        <ShellModalHeader
          parentLabel={moduleLabel}
          currentLabel={createLabel}
          onClose={closeCreateModal}
        />
        <Box px={MODAL_BODY_PADDING} pb={MODAL_BODY_PADDING}>
          {CreateFormComponent && (
            <CreateFormComponent
              onSubmit={createMutation.mutate}
              isLoading={createMutation.isPending}
            />
          )}
        </Box>
      </Modal>

      <Modal
        opened={isEditModalOpen}
        onClose={handleEditModalClose}
        size={modalWidth}
        centered
        padding={0}
        withCloseButton={false}
      >
        <ShellModalHeader
          parentLabel={moduleLabel}
          currentLabel={editLabel}
          onClose={handleEditModalClose}
        />
        <Box px={MODAL_BODY_PADDING} pb={MODAL_BODY_PADDING}>
          {editLoading ? (
            <Center py="xl">
              <Loader size="sm" />
            </Center>
          ) : (
            EditFormComponent &&
            activeEditRecord && (
              <EditFormComponent
                initialValues={activeEditRecord}
                onSubmit={editMutation.mutate}
                isLoading={editMutation.isPending}
              />
            )
          )}
        </Box>
      </Modal>
    </>
  );
}
