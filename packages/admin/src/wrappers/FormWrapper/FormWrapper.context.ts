"use client";

import { createContext, useContext } from "react";
import type {
  FormInstanceContextValue,
  FormControlsContextValue,
  FormValues,
} from "./FormWrapper.types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const FormInstanceContext =
  createContext<FormInstanceContextValue<any> | null>(null);
FormInstanceContext.displayName = "FormInstanceContext";

export const FormControlsContext =
  createContext<FormControlsContextValue | null>(null);
FormControlsContext.displayName = "FormControlsContext";

export function useFormInstanceContext<
  T extends FormValues,
>(): FormInstanceContextValue<T> {
  const ctx = useContext(FormInstanceContext);
  if (!ctx)
    throw new Error("useFormInstance must be used inside <FormWrapper>");
  return ctx as FormInstanceContextValue<T>;
}

export function useFormControlsContext(): FormControlsContextValue {
  const ctx = useContext(FormControlsContext);
  if (!ctx)
    throw new Error("useFormControls must be used inside <FormWrapper>");
  return ctx;
}
