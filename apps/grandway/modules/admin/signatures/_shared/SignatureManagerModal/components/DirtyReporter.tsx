"use client";

import { useEffect } from "react";
import { useFormControls } from "@peppermint/admin";

/**
 * Which sub-form is reporting. The edit screen hosts **two independent
 * `FormWrapper`s** — the details fields and the signature-image picker — and
 * either can hold unsaved input on its own. A single boolean would let one
 * clear the other's flag, so the shell tracks them by name.
 */
export type DirtySource = "details" | "signature-image";

export type ReportDirty = (source: DirtySource, dirty: boolean) => void;

interface DirtyReporterProps {
  source: DirtySource;
  /** **Must be referentially stable** — it is an effect dependency. */
  onDirtyChange: ReportDirty;
}

/**
 * Publishes a form's `isDirty` up to the modal shell. It renders nothing and
 * lives inside `FormWrapper` because that is the only place the state exists —
 * the shell needs it to guard the back arrow, Escape, the backdrop and the
 * close button, none of which a form can see.
 */
export function DirtyReporter({ source, onDirtyChange }: DirtyReporterProps) {
  const { isDirty } = useFormControls();
  useEffect(() => {
    onDirtyChange(source, isDirty);
    // Unmounting means the form is gone, so there is nothing left to discard —
    // without this, leaving a dirty form would arm the guard permanently.
    return () => onDirtyChange(source, false);
  }, [source, isDirty, onDirtyChange]);
  return null;
}
