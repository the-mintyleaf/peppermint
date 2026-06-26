import {
  useFormInstanceContext,
  useFormControlsContext,
} from "./FormWrapper.context";
import type {
  FormInstanceContextValue,
  FormControlsContextValue,
  FormValues,
} from "./FormWrapper.types";

/**
 * Returns the stable Mantine form instance.
 * Subscribe here for field rendering — never re-renders on navigation or submit changes.
 * Throws if called outside <FormWrapper>.
 */
export function useFormInstance<
  T extends FormValues = FormValues,
>(): FormInstanceContextValue<T> {
  return useFormInstanceContext<T>();
}

/**
 * Returns navigation and submission state.
 * Subscribe here for steppers, footers, and submit buttons — never re-renders on keystrokes
 * unless hasDirtCheck={true}, in which case re-renders when isDirty changes.
 * Throws if called outside <FormWrapper>.
 */
export function useFormControls(): FormControlsContextValue {
  return useFormControlsContext();
}
