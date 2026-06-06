"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { CertificateContent } from "@/modules/documents/documents.types";

export interface CertificateMarkEntry {
  month: string | number;
  total_days?: number;
  class_hr?: number;
  present?: number;
  absent?: number;
  attendance_percentage?: number | string;
}

export type StudentCertificateData = CertificateContent;

interface DocumentContextValue {
  documentData: StudentCertificateData | null;
}

const DocumentContext = createContext<DocumentContextValue>({
  documentData: null,
});

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

export function useDocContext() {
  return useContext(DocumentContext);
}
