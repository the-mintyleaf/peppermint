"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { LeadFormSubmitError } from "./LeadForm.types";

/**
 * Carries the last failed lead create/edit request from the board to the
 * open `LeadForm`. `ModalTableShell` runs the mutation itself and only toasts
 * the error — its form props (`onSubmit`, `isLoading`) have no error channel —
 * so without this, `LEADS_STUDY_INTEREST_INVALID` / `LEADS_CERTIFICATE_INVALID`
 * field details would never reach the fields they name. The shell's modal is
 * portalled, but still inside this provider's React tree.
 */
export const LeadFormSubmitErrorContext =
  createContext<LeadFormSubmitError | null>(null);

export function useLeadFormSubmitError(): LeadFormSubmitError | null {
  return useContext(LeadFormSubmitErrorContext);
}

/**
 * Board side: `captureSubmitError(createLead(values))` records a rejection
 * (and rethrows it, so the shell still toasts and keeps the modal open).
 */
export function useLeadFormSubmitErrorChannel() {
  const [submitError, setSubmitError] = useState<LeadFormSubmitError | null>(
    null,
  );

  const captureSubmitError = useCallback(
    async <T>(request: Promise<T>): Promise<T> => {
      try {
        return await request;
      } catch (error) {
        setSubmitError((previous) => ({
          error,
          seq: (previous?.seq ?? 0) + 1,
        }));
        throw error;
      }
    },
    [],
  );

  return { submitError, captureSubmitError };
}
