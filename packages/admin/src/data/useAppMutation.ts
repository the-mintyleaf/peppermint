"use client";

import { useMutation, useQueryClient, notifications } from "@peppermint/ui";
import type { QueryKey, UseMutationResult } from "@peppermint/ui";

// Absorbs the copy-pasted mutation trio (useMutation + success notification +
// invalidate + error notification via getApiErrorMessage) that every row-action
// menu and modal re-implements. The app's error-code → message resolver is
// app-specific, so it's injected once at boot via `configureAppMutations`.

/** Generic fallback used until the app configures its own resolver. */
function genericErrorMessage(error: unknown): string {
  const e = error as {
    response?: { data?: { error?: { message?: string } } };
    message?: string;
  };
  return (
    e?.response?.data?.error?.message ??
    e?.message ??
    "Something went wrong. Please try again."
  );
}

let defaultGetErrorMessage: (error: unknown) => string = genericErrorMessage;

/**
 * Set framework-wide mutation defaults once at app boot. Typically:
 * `configureAppMutations({ getErrorMessage: getApiErrorMessage })`.
 */
export function configureAppMutations(options: {
  getErrorMessage?: (error: unknown) => string;
}): void {
  if (options.getErrorMessage) defaultGetErrorMessage = options.getErrorMessage;
}

export interface AppMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  /** Green toast on success. String, or a builder from the result/variables. */
  successMessage?: string | ((data: TData, variables: TVariables) => string);
  successTitle?: string;
  errorTitle?: string;
  /** Query keys invalidated on success. */
  invalidateKeys?: QueryKey[];
  /** Override the configured error-message resolver for this mutation. */
  getErrorMessage?: (error: unknown) => string;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: unknown, variables: TVariables) => void;
}

export function useAppMutation<TData = unknown, TVariables = void>(
  options: AppMutationOptions<TData, TVariables>,
): UseMutationResult<TData, unknown, TVariables> {
  const queryClient = useQueryClient();
  const resolveError = options.getErrorMessage ?? defaultGetErrorMessage;

  return useMutation<TData, unknown, TVariables>({
    mutationFn: options.mutationFn,
    onSuccess: (data, variables) => {
      options.invalidateKeys?.forEach((queryKey) => {
        void queryClient.invalidateQueries({ queryKey });
      });
      if (options.successMessage !== undefined) {
        const message =
          typeof options.successMessage === "function"
            ? options.successMessage(data, variables)
            : options.successMessage;
        notifications.show({
          color: "green",
          title: options.successTitle ?? "Success",
          message,
        });
      }
      options.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      notifications.show({
        color: "red",
        title: options.errorTitle ?? "Something went wrong",
        message: resolveError(error),
      });
      options.onError?.(error, variables);
    },
  });
}
