import type { AdminShellSearchResult } from "@peppermint/admin";

/**
 * Which backends the signed-in role may query. Every field is derived from the
 * capability of the same name in `config/access` — searching a domain a role cannot
 * see would leak its existence through a 403 (or worse, through results), so this
 * must never be looser than the nav.
 */
export interface GlobalSearchAccess {
  /** `applicants` — admin/lead_manager, never superadmin. */
  applicants: boolean;
  /** `leads` — admin/lead_manager, never superadmin. */
  leads: boolean;
  /** `clients` — Admin only. */
  clients: boolean;
  /** `catalogue` (programs + institutions) — Admin only. */
  catalogue: boolean;
  /** `documents` — the right to read a document at all. */
  documents: boolean;
  /**
   * `document-templates` signatories. Split out from `documents` because a reader
   * who cannot write has no use for them and cannot reach the screen a hit links to
   * (`/admin/documents`, the Admin-only workspaces roll-up) — riding on `documents`
   * would hand a Lead Manager results that dead-end in a forbidden panel.
   */
  signatories: boolean;
  /** `checklists` templates — Admin only. */
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
