import type { ReactNode } from "react";
import type { ZodTypeAny } from "zod";
import type { UseFormReturnType } from "@mantine/form";

export type FormValues = Record<string, unknown>;
export type StepStatus = "pending" | "complete" | "error";

export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  message?: string;
}

export type StepApiMode = "on-next" | "on-submit";

export interface StepApiConfig<T extends FormValues> {
  mode: StepApiMode;
  /**
   * Called when no ID is stored for this step yet (create path).
   * Receives only the fields relevant to this step + all IDs collected so far.
   * Must return an ApiResponse — if the created resource has an ID, include it in data.id.
   */
  createFn: (
    data: Partial<T>,
    stepIds: Record<number, string>,
  ) => Promise<ApiResponse<{ id?: string } | undefined>>;
  /**
   * Called when an ID is already stored for this step (patch path).
   * If omitted, createFn is always used regardless of whether an ID exists.
   */
  patchFn?: (
    id: string,
    data: Partial<T>,
    stepIds: Record<number, string>,
  ) => Promise<ApiResponse>;
}

export interface FormWrapperProps<T extends FormValues> {
  initial: T;
  /**
   * Sparse array indexed by step number.
   * Steps with no entry are validation-only — no API call fires on Next or Submit.
   */
  stepApiConfigs?: (StepApiConfig<T> | undefined)[];
  /**
   * Called after all on-submit steps complete.
   * Receives full form values + the complete stepIds map.
   */
  finalSubmitFn?: (
    data: T,
    stepIds: Record<number, string>,
  ) => Promise<ApiResponse>;
  /**
   * Fired after any step's API call succeeds.
   * id is the value from response.data.id (if returned), otherwise undefined.
   */
  onStepSuccess?: (
    stepIndex: number,
    id: string | undefined,
    responseData: unknown,
  ) => void;
  /** Sparse array — index matches step. Step with no entry is always valid. */
  validation?: ZodTypeAny[];
  /** Field dot-paths per step for scoped validation on handleStepNext. */
  stepFields?: string[][];
  /** Step indices that are skipped when navigating next/back. */
  disabledSteps?: number[];
  formClearOnSuccess?: boolean;
  /** Exposes isDirty on FormControlsContext so FormShell can render the dirty banner. */
  hasDirtCheck?: boolean;
  children: ReactNode;
}

export interface FormInstanceContextValue<T extends FormValues = FormValues> {
  form: UseFormReturnType<T>;
}

export interface FormControlsContextValue {
  current: number;
  isLoading: boolean;
  stepStatus: Record<number, StepStatus>;
  /** IDs returned by per-step API calls, keyed by step index. */
  stepIds: Record<number, string>;
  /** 0–100. Based on completed step count. Always 0 for single-step forms. */
  completionPct: number;
  /** Always false when hasDirtCheck is absent. */
  isDirty: boolean;
  handleSubmit: () => Promise<void>;
  handleStepNext: () => void;
  handleStepBack: () => void;
  handleStepGo: (step: number) => void;
}
