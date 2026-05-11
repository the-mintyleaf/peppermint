import type { UseFormReturnType } from '@mantine/form';
import type { ZodTypeAny } from 'zod';
import type { ApiResponse } from '@zetsel/api-client';

export type FormValues = Record<string, unknown>;

export type StepStatus = 'pending' | 'complete' | 'error';

// --- Context value types ---

export interface FormInstanceContextValue<T extends FormValues = FormValues> {
  form: UseFormReturnType<T>;
}

export interface FormControlsContextValue {
  current: number;
  isLoading: boolean;
  stepStatus: Record<number, StepStatus>;
  completionPct: number;
  handleSubmit: () => void;
  handleStepNext: () => void;
  handleStepBack: () => void;
  handleStepGo: (step: number) => void;
}

// --- Component props ---

export interface FormWrapperProps<T extends FormValues> {
  initial: T;
  apiSubmitFn: (data: T) => Promise<ApiResponse<unknown>>;

  /** Sparse array — index matches step index. Step with no entry is always valid. */
  validation?: ZodTypeAny[];

  /** Receives a structuredClone of values — safe to mutate. */
  transformFnSubmit?: (data: T) => T;

  submitSuccessFn?: () => void;

  /** Keys belonging to each step, used for per-step validation. */
  stepFields?: string[][];

  hasDirtCheck?: boolean;
  formClearOnSuccess?: boolean;

  children: React.ReactNode;
}
