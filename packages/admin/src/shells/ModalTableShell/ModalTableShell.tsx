"use client";

import { useState, useCallback, useMemo } from "react";
import { useDisclosure } from "@peppermint/ui";
import { modals, notifications } from "@peppermint/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Group, Text } from "@peppermint/ui";
import { WarningCircleIcon } from "@phosphor-icons/react/dist/csr/WarningCircle";
import { DataTableShell } from "../DataTableShell";
import { ModalTableShellContext } from "./ModalTableShell.context";
import { ModalHandler } from "./components/ModalHandler";
import type {
  ModalTableShellProps,
  ModalTableShellContextValue,
} from "./ModalTableShell.types";

export function ModalTableShell<
  TRow extends object,
  TCreate = TRow,
  TEdit = TCreate,
>({
  queryKey,
  moduleInfo,
  modalWidth,
  createModalTitle,
  editModalTitle,
  createFormComponent,
  editFormComponent,
  onCreateApi,
  onEditApi,
  onDeleteApi,
  onCreateSuccess,
  onEditSuccess,
  onDeleteSuccess,
  onEditTrigger,
  transformOnCreate,
  transformOnEdit,
  transformOnDelete,
  onReviewClick,
  disableReviewButton,
  getErrorMessage,
  ...rest
}: ModalTableShellProps<TRow, TCreate, TEdit>) {
  const [isCreateModalOpen, handlersCreateModal] = useDisclosure(false);
  const [isEditModalOpen, handlersEditModal] = useDisclosure(false);
  const [activeEditRecord, setActiveEditRecord] = useState<TRow | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const queryClient = useQueryClient();

  const invalidate = useCallback(() => {
    const normalizedKey =
      typeof queryKey === "string" ? queryKey.split(".") : queryKey;
    void queryClient.invalidateQueries({
      queryKey: normalizedKey,
    });
  }, [queryClient, queryKey]);

  const handleNewClick = useCallback(() => {
    handlersCreateModal.open();
  }, [handlersCreateModal]);

  const handleEditClick = useCallback(
    async (record: TRow) => {
      if (onEditTrigger) {
        setEditLoading(true);
        handlersEditModal.open();
        try {
          const enriched = await onEditTrigger(record);
          setActiveEditRecord(enriched);
        } catch (error) {
          console.error("Error in onEditTrigger:", error);
          notifications.show({
            color: "red",
            title: "Error",
            message: `Failed to load ${moduleInfo.label ?? moduleInfo.name} details.`,
          });
          handlersEditModal.close();
        } finally {
          setEditLoading(false);
        }
      } else {
        setActiveEditRecord(record);
        handlersEditModal.open();
      }
    },
    [onEditTrigger, handlersEditModal, moduleInfo],
  );

  const deleteMutation = useMutation({
    mutationFn: async (ids: Array<string | number>) => {
      if (!onDeleteApi) return;
      const results = await Promise.allSettled(
        ids.map((id) => {
          const idToSubmit = transformOnDelete ? transformOnDelete(id) : id;
          return onDeleteApi(idToSubmit as string | number);
        }),
      );
      const failures = results.filter((r) => r.status === "rejected");
      if (failures.length > 0) {
        throw new Error(
          `${failures.length} deletion${failures.length === 1 ? "" : "s"} failed`,
        );
      }
    },
    onSuccess: () => {
      notifications.show({
        color: "green",
        title: "Deleted",
        message: `${moduleInfo.label ?? moduleInfo.name} deleted successfully.`,
      });
      onDeleteSuccess?.();
    },
    onError: (err) => {
      notifications.show({
        color: "red",
        title: "Error",
        message:
          err instanceof Error
            ? err.message
            : `Failed to delete ${moduleInfo.label ?? moduleInfo.name}.`,
      });
    },
    // Invalidate on settled (not just success) so a partial bulk-delete failure
    // still refreshes away the rows that WERE deleted.
    onSettled: () => {
      invalidate();
    },
  });

  const handleDeleteClick = useCallback(
    (ids: Array<string | number>) => {
      modals.openConfirmModal({
        title: (
          <Group gap="xs">
            <WarningCircleIcon
              size={18}
              color="var(--mantine-color-red-6)"
              weight="fill"
              aria-hidden
            />
            <Text size="sm" fw={600} c="red">
              Delete {moduleInfo.label ?? moduleInfo.name}
            </Text>
          </Group>
        ),
        children: (
          <Text size="sm">
            {ids.length === 1
              ? `Are you sure you want to delete this ${moduleInfo.name}? This action cannot be undone.`
              : `Are you sure you want to delete ${ids.length} ${moduleInfo.name}? This action cannot be undone.`}
          </Text>
        ),
        confirmProps: { color: "red", size: "xs" },
        cancelProps: { size: "xs" },
        labels: { confirm: "Delete", cancel: "Cancel" },
        onConfirm: () => {
          deleteMutation.mutate(ids);
        },
      });
    },
    [deleteMutation, moduleInfo],
  );

  const disableCreateButton = !createFormComponent;
  const disableEditButton = !editFormComponent;
  const disableDeleteButton = !onDeleteApi;

  const contextValue: ModalTableShellContextValue<TRow> = useMemo(
    () => ({
      isCreateModalOpen,
      isEditModalOpen,
      activeEditRecord,
      editLoading,
      openCreateModal: handlersCreateModal.open,
      closeCreateModal: handlersCreateModal.close,
      openEditModal: handleEditClick,
      closeEditModal: handlersEditModal.close,
      setEditLoading,
      setActiveEditRecord,
    }),
    [
      isCreateModalOpen,
      isEditModalOpen,
      activeEditRecord,
      editLoading,
      handlersCreateModal,
      handlersEditModal,
      handleEditClick,
    ],
  );

  return (
    <ModalTableShellContext.Provider value={contextValue}>
      <DataTableShell<TRow>
        {...rest}
        queryKey={queryKey}
        moduleInfo={moduleInfo}
        sustained={true}
        onNewClick={handleNewClick}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
        onReviewClick={onReviewClick}
        disableCreateButton={disableCreateButton}
        disableEditButton={disableEditButton}
        disableDeleteButton={disableDeleteButton}
        disableReviewButton={disableReviewButton}
      />
      {(onCreateApi || onEditApi) && (
        <ModalHandler<TRow, TCreate, TEdit>
          queryKey={queryKey}
          moduleInfo={moduleInfo}
          modalWidth={modalWidth}
          createModalTitle={createModalTitle}
          editModalTitle={editModalTitle}
          createFormComponent={createFormComponent}
          editFormComponent={editFormComponent}
          onCreateApi={onCreateApi}
          onEditApi={onEditApi}
          transformOnCreate={transformOnCreate}
          transformOnEdit={transformOnEdit}
          onCreateSuccess={onCreateSuccess}
          onEditSuccess={onEditSuccess}
          getErrorMessage={getErrorMessage}
        />
      )}
    </ModalTableShellContext.Provider>
  );
}
