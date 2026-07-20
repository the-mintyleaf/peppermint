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
 * Resolved student-certificate content. The string/number fields are required (the template
 * passes them to `formatDate`, grade comparisons and arithmetic without guarding). `batch`,
 * `image`, `customBranch` and `customBranchNo` are optional — the certificate form does not
 * emit `batch`, so the template guards every access (`d.batch?.course?…`) and renders blank
 * when it is absent.
 */
export interface StudentCertificateData {
  firstname: string;
  middlename: string;
  lastname: string;
  date_of_birth: string;
  gender: string;
  address: string;
  date_of_admission: string;
  date_of_completion: string;
  issue: string;
  coursehour: number;
  grammar: string;
  listening: string;
  conversation: string;
  reading: string;
  composition: string;
  studyType: 0 | 1;
  image?: string;
  customBranch?: string;
  customBranchNo?: string;
  batch?: {
    course?: {
      name?: string;
      level?: string;
      total_days?: number;
      books?: Array<{ name: string }>;
    };
    instructor?: unknown[];
  };
  marking?: CertificateMarkEntry[];
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
