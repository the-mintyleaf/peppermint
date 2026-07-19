"use client";

import { createContext, useContext, useMemo, useState } from "react";

import { ApplicantProfileModal } from "./ApplicantProfileModal";

interface ApplicantProfileContextValue {
  /** Open the profile hub for an applicant (by id). */
  openProfile: (applicantId: string) => void;
  closeProfile: () => void;
}

const ApplicantProfileContext =
  createContext<ApplicantProfileContextValue | null>(null);

/** Read the profile-hub controls; must be called under `ApplicantProfileProvider`. */
export function useApplicantProfile(): ApplicantProfileContextValue {
  const ctx = useContext(ApplicantProfileContext);
  if (!ctx) {
    throw new Error(
      "useApplicantProfile must be used within an ApplicantProfileProvider",
    );
  }
  return ctx;
}

/**
 * Owns the "which applicant profile is open" state for the applicants list and renders
 * the modal once at the subtree root, so any row action can open the hub without prop
 * drilling or a second modal instance.
 */
export function ApplicantProfileProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [viewId, setViewId] = useState<string | null>(null);

  const value = useMemo<ApplicantProfileContextValue>(
    () => ({
      openProfile: (applicantId) => setViewId(applicantId),
      closeProfile: () => setViewId(null),
    }),
    [],
  );

  return (
    <ApplicantProfileContext.Provider value={value}>
      {children}
      <ApplicantProfileModal
        applicantId={viewId}
        onClose={() => setViewId(null)}
      />
    </ApplicantProfileContext.Provider>
  );
}
