import React, { useState } from 'react';
import { DataTableShell } from '../DataTableShell';
import { CreateModal } from './components/CreateModal';
import { EditModal } from './components/EditModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import type { DataTableModalShellProps } from './DataTableModalShell.types';
import type { FormValues } from '../../wrappers/FormWrapper';

export function DataTableModalShell<T = unknown, TCreate extends FormValues = FormValues, TEdit extends FormValues = FormValues>({
  moduleInfo,
  queryKey,
  queryGetFn,
  columns,
  idAccessor,
  onCreateApi,
  onEditApi,
  onDeleteApi,
  createFormComponent,
  editFormComponent,
  createInitial,
  editInitial,
  filterList,
  modalSize,
  pageSizes,
  onCreateSuccess,
  onEditSuccess,
  onDeleteSuccess,
}: DataTableModalShellProps<T, TCreate, TEdit>) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<T | null>(null);
  const [deleteIds, setDeleteIds] = useState<Array<string | number>>([]);

  function handleEditClick(id: string | number, row: T) {
    void id;
    setEditRecord(row);
  }

  function handleDeleteClick(ids: Array<string | number>) {
    setDeleteIds(ids);
  }

  return (
    <>
      <DataTableShell<T>
        moduleInfo={moduleInfo}
        queryKey={queryKey}
        queryGetFn={queryGetFn}
        columns={columns}
        idAccessor={idAccessor}
        onNewClick={() => setCreateOpen(true)}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
        filterList={filterList}
        pageSizes={pageSizes}
      />

      <CreateModal<TCreate>
        opened={createOpen}
        onClose={() => setCreateOpen(false)}
        queryKey={queryKey}
        initial={createInitial}
        apiSubmitFn={onCreateApi}
        formComponent={createFormComponent}
        modalSize={modalSize}
        onSuccess={onCreateSuccess}
      />

      <EditModal<T, TEdit>
        opened={editRecord !== null}
        onClose={() => setEditRecord(null)}
        queryKey={queryKey}
        record={editRecord}
        editInitial={editInitial}
        apiSubmitFn={onEditApi}
        idAccessor={idAccessor}
        formComponent={editFormComponent}
        modalSize={modalSize}
        onSuccess={onEditSuccess}
      />

      <DeleteConfirmModal
        opened={deleteIds.length > 0}
        onClose={() => setDeleteIds([])}
        queryKey={queryKey}
        ids={deleteIds}
        onDeleteApi={onDeleteApi}
        onSuccess={() => {
          setDeleteIds([]);
          onDeleteSuccess?.();
        }}
      />
    </>
  );
}
