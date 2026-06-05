import type { DocumentType } from "./documents.types";

export const documentQueryKeys = {
  list: (studentId: string) => ["documents", "list", studentId] as const,
  detail: (documentId: string) => ["documents", "detail", documentId] as const,
  printLogs: (documentId: string) => ["documents", "logs", documentId] as const,
  signatures: () => ["documents", "signatures"] as const,
  studentFull: (studentId: string) => ["documents", "studentFull", studentId] as const,
  workspaces: () => ["documents", "workspaces"] as const,
  logsByType: (studentId: string, type: DocumentType) =>
    ["documents", "logs", "student", studentId, type] as const,
};
