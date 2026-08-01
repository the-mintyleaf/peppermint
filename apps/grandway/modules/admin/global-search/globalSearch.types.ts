import type { AdminShellSearchResult } from "@peppermint/admin";

/**
 * Which backends the signed-in role may query. Mirrors the nav-visibility flags
 * in `config/nav/admin-nav.ts` exactly — searching a domain a role cannot see
 * would leak its existence through a 403 (or worse, through results).
 */
export interface GlobalSearchAccess {
  /** `applicants` — admin/lead_manager, never superadmin. */
  applicants: boolean;
  /** `leads` — admin/lead_manager, never superadmin. */
  leads: boolean;
  /** `clients` — shared reads, admin writes, never superadmin. */
  clients: boolean;
  /** `catalogue` (programs + institutions) — shared reads, never superadmin. */
  catalogue: boolean;
  /** `documents` **and** `document-templates` signatories — Admin only. */
  documents: boolean;
  /** `checklists` templates — admin/lead_manager reads. */
  checklists: boolean;
}

export interface GlobalSearchOptions {
  access: GlobalSearchAccess;
  signal?: AbortSignal;
  /** Rows requested per domain. @default 5 */
  perDomainLimit?: number;
}

/** One searchable backend, reduced to what the fan-out needs. */
export interface GlobalSearchSource {
  /** Result group heading — also the display order key. */
  group: string;
  enabled: (access: GlobalSearchAccess) => boolean;
  run: (
    query: string,
    limit: number,
    signal?: AbortSignal,
  ) => Promise<AdminShellSearchResult[]>;
}
