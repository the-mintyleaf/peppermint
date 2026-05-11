import { useContext } from 'react';
import { FormInstanceContext, FormControlsContext } from './FormWrapper.context';
import type { FormInstanceContextValue, FormControlsContextValue, FormValues } from './FormWrapper.types';

export function useFormInstance<T extends FormValues = FormValues>(): FormInstanceContextValue<T> {
  const ctx = useContext(FormInstanceContext);
  if (!ctx) {
    throw new Error('useFormInstance must be used inside a FormWrapper');
  }
  return ctx as FormInstanceContextValue<T>;
}

export function useFormControls(): FormControlsContextValue {
  const ctx = useContext(FormControlsContext);
  if (!ctx) {
    throw new Error('useFormControls must be used inside a FormWrapper');
  }
  return ctx;
}
