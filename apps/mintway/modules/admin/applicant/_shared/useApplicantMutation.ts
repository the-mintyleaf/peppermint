"use client";

import { useAppMutation } from "@peppermint/admin";
import type { AppMutationOptions } from "@peppermint/admin";

import { getApiErrorMessage } from "@/lib/authErrorMessages";

/**
 * `useAppMutation` with the app's `APPLICANT_*` error resolver baked in. The app never
 * calls `configureAppMutations` at boot (its auth modules pass the resolver inline), so
 * every applicant mutation injects it here rather than relying on global config.
 */
export function useApplicantMutation<TData = unknown, TVariables = void>(
  options: AppMutationOptions<TData, TVariables>,
) {
  return useAppMutation<TData, TVariables>({
    getErrorMessage: getApiErrorMessage,
    ...options,
  });
}
