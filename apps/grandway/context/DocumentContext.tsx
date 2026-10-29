"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * Read-only document data context for the certificate template family.
 *
 * The student certificate template reads its resolved content via `useDocContext()` (or an
 * explicit `overrideData` prop). The document editor supplies the content through
 * `DocumentContextProvider`. This context is intentionally render-only — templates never
 * mutate it. Bank / WODA templates read their values through `FormHandler` instead; the data
 * types below are shared here because the copied templates import them from this module.
 */

/** One attendance row on the student certificate. */
export interface CertificateMarkEntry {
  month: string | number;
  total_days?: number;
  class_hr?: number;
  present?: number;
  absent?: number;
  attendance_percentage?: number | string;
}

/**
 * Resolved student-certificate data, in the backend's validated key names
 * (`documents/INTEGRATION.md` §7). Every field is already resolved — the adapter
 * (`modules/documents/document-types/student-certificate/CertificateTemplate.tsx`)
 * reads both the current keys and the ones certificates were saved under before
 * 2026-10-29, so the template never sees the legacy shape. `image` is the resolved
 * portrait URL, or `""` for the grey placeholder box.
 */
export interface StudentCertificateData {
  firstname: string;
  middlename: string;
  lastname: string;
  date_of_birth: string;
  /** `male` | `female` | `other` | `""`. */
  gender: string;
  address: string;
  date_of_admission: string;
  date_of_completion: string;
  issue: string;
  course_name: string;
  course_level: string;
  course_books: string[];
  /** `0` when not given. */
  course_total_days: number;
  /** `0` when not given. */
  course_hours_per_day: number;
  grades: {
    grammar: string;
    listening: string;
    conversation: string;
    reading: string;
    composition: string;
  };
  study_type: 0 | 1;
  image: string;
  branch_name: string;
  branch_no: string;
  marking: CertificateMarkEntry[];
}

/** Loose bag of bank statement/certificate fields read through `FormHandler`. */
export type BankStatementData = Record<string, unknown> & {
  bank?: string;
  bank_template?: string;
};

/** Loose bag of WODA document fields read through `FormHandler`. */
export type WodaDocData = Record<string, unknown> | null | undefined;

interface DocContextValue {
  documentData: StudentCertificateData | null;
}

const DocumentContext = createContext<DocContextValue>({ documentData: null });

export function DocumentContextProvider({
  documentData,
  children,
}: {
  documentData: StudentCertificateData | null;
  children: ReactNode;
}) {
  return (
    <DocumentContext.Provider value={{ documentData }}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocContext(): DocContextValue {
  return useContext(DocumentContext);
}
