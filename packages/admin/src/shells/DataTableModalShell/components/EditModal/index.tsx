import React from 'react';
import { Modal } from '@zetsel/ui';
import { FormWrapper } from '../../../../wrappers/FormWrapper';
import { useInvalidateTable } from '../../../../wrappers/DataTableWrapper';
import type { FormValues } from '../../../../wrappers/FormWrapper';
import type { ApiResponse } from '@zetsel/api-client';

interface EditModalProps<T, TForm extends FormValues> {
  opened: boolean;
  onClose: () => void;
  queryKey: string;
  record: T | null;
  editInitial: (record: T) => TForm;
  apiSubmitFn: (id: string | number, data: TForm) => Promise<ApiResponse<unknown>>;
  idAccessor: keyof T & string;
  formComponent: React.ComponentType<{ record: T }>;
  modalSize?: string | number;
  onSuccess?: (data: unknown) => void;
}

export function EditModal<T, TForm extends FormValues>({
  opened,
  onClose,
  queryKey,
  record,
  editInitial,
  apiSubmitFn,
  idAccessor,
  formComponent: FormComponent,
  modalSize = 'md',
  onSuccess,
}: EditModalProps<T, TForm>) {
  const invalidate = useInvalidateTable(queryKey);

  if (!record) return null;

  const id = record[idAccessor] as string | number;

  function handleSuccess() {
    invalidate();
    onSuccess?.(undefined);
    onClose();
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Edit" size={modalSize}>
      <FormWrapper<TForm>
        initial={editInitial(record)}
        apiSubmitFn={(data) => apiSubmitFn(id, data)}
        submitSuccessFn={handleSuccess}
      >
        <FormComponent record={record} />
      </FormWrapper>
    </Modal>
  );
}
