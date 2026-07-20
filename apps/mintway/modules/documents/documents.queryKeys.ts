export const documentQueryKeys = {
  all: ["documents"] as const,
  list: (applicantId: string) => ["documents", "list", applicantId] as const,
  detail: (documentId: string) => ["documents", "detail", documentId] as const,
  prefill: (applicantId: string) =>
    ["documents", "prefill", applicantId] as const,
  printEvents: (documentId: string | null) =>
    ["documents", "print-events", documentId] as const,
  revisions: (documentId: string | null) =>
    ["documents", "revisions", documentId] as const,
  /**
   * Cross-applicant search. The criteria are serialized rather than nested so the key stays a
   * `readonly string[]` — the shape `DataTableShell`'s wrapper accepts, and which it appends
   * page / pageSize / sort to in server-query mode.
   */
  search: (criteria: object = {}) =>
    ["documents", "search", JSON.stringify(criteria)] as const,
  signatures: () => ["documents", "signatures"] as const,
  signatureImage: (signatureId: string) =>
    ["documents", "signature-image", signatureId] as const,
  workspaces: () => ["documents", "workspaces"] as const,
};

export const documentMutationKeys = {
  remove: () => ["documents", "remove"] as const,
};
