import React from 'react';
import { Modal } from '@zetsel/ui';
import { FormWrapper } from '../../../../wrappers/FormWrapper';
import { useInvalidateTable } from '../../../../wrappers/DataTableWrapper';
import type { FormValues } from '../../../../wrappers/FormWrapper';
import type { ApiResponse } from '@zetsel/api-client';

interface CreateModalProps<T extends FormValues> {
  opened: boolean;
  onClose: () => void;
  queryKey: string;
  initial: T;
  apiSubmitFn: (data: T) => Promise<ApiResponse<unknown>>;
  formComponent: React.ComponentType;
  modalSize?: string | number;
  onSuccess?: (data: unknown) => void;
}

export function CreateModal<T extends FormValues>({
  opened,
  onClose,
  queryKey,
  initial,
  apiSubmitFn,
  formComponent: FormComponent,
  modalSize = 'md',
  onSuccess,
}: CreateModalProps<T>) {
  const invalidate = useInvalidateTable(queryKey);

  function handleSuccess() {
    invalidate();
    onSuccess?.(undefined);
    onClose();
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Create" size={modalSize}>
      <FormWrapper<T>
        initial={initial}
        apiSubmitFn={apiSubmitFn}
        submitSuccessFn={handleSuccess}
        formClearOnSuccess
      >
        <FormComponent />
      </FormWrapper>
    </Modal>
  );
}
