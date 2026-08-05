import api from "@/lib/api";
import type { ApplicantStatus } from "../applicants/applicants.types";
import type { LeadStage } from "../lead-management/leadManagement.types";
import type { ClientStatus } from "../clients/clients.types";
import type { TemplateStatus } from "../checklists/checklists.types";
import type {
  DocumentFamily,
  DocumentStatus,
} from "@/modules/documents/documents.types";

/**
 * Raw list envelope shared by every searchable endpoint (`{ data, meta.count }`).
 * The fan-out reads a handful of fields per row and maps them straight to
 * spotlight results, so it types each row locally rather than importing (and
 * dragging in) each module's full read shape.
 */
interface ListEnvelope<T> {
  data: T[];
  meta: { count: number } & Record<string, unknown>;
}

/**
 * One paginated search request. `signal` comes from the shell's React Query
 * instance — a superseded keystroke aborts the in-flight request rather than
 * letting eight domains' worth of responses pile up behind the user's typing.
 */
async function searchList<T>(
  path: string,
  params: Record<string, unknown>,
  limit: number,
  signal?: AbortSignal,
): Promise<T[]> {
  const { data } = await api.get<ListEnvelope<T>>(path, {
    params: { page: 1, page_size: limit, ...params },
    signal,
  });
  return data.data;
}

// ── Applicants ───────────────────────────────────────────────────────────────
//
// `?search=` matches `full_name`, email, any contact number, and the passport
// number, ordered by relevance (exact name > prefix > contains > matched on a
// non-name field). English-only single `full_name` since the backend dropped the
// `_np`/`_romanized` columns.

export interface ApplicantSearchRow {
  id: string;
  full_name: string;
  email: string;
  status: ApplicantStatus;
}

export const searchApplicants = (
  query: string,
  limit: number,
  signal?: AbortSignal,
) =>
  searchList<ApplicantSearchRow>(
    "/api/v1/applicants/",
    { search: query },
    limit,
    signal,
  );

// ── Leads ────────────────────────────────────────────────────────────────────
//
// `?search=` matches `full_name`, email, and any contact number, relevance-ranked.

export interface LeadSearchRow {
  id: string;
  /** Single English name since the backend dropped the `_np`/`_romanized` columns. */
  full_name?: string;
  /**
   * Pre-rename fallback, matching `Lead` in `leadManagement.types.ts`: the
   * frontend's copy of the leads contract still documents the bilingual triple,
   * so a deployment on the older shape must not render every lead as unnamed.
   */
  full_name_en?: string;
  email: string;
  stage: LeadStage;
}

export const searchLeads = (
  query: string,
  limit: number,
  signal?: AbortSignal,
) =>
  searchList<LeadSearchRow>("/api/v1/leads/", { search: query }, limit, signal);

// ── Clients ──────────────────────────────────────────────────────────────────
//
// `?search=` covers the organization name and the spokesperson name.

export interface ClientSearchRow {
  id: string;
  name: string;
  spokesperson_name: string;
  status: ClientStatus;
}

export const searchClients = (
  query: string,
  limit: number,
  signal?: AbortSignal,
) =>
  searchList<ClientSearchRow>(
    "/api/v1/clients/",
    { search: query },
    limit,
    signal,
  );

// ── Catalogue ────────────────────────────────────────────────────────────────
//
// The catalogue searches on `q`, NOT the DRF-default `search` — and rejects
// unknown query params outright rather than ignoring them.

export interface ProgramSearchRow {
  id: string;
  title: string;
  institution: { id: string; name: string };
  country: { id: string; name: string };
}

export const searchPrograms = (
  query: string,
  limit: number,
  signal?: AbortSignal,
) =>
  searchList<ProgramSearchRow>(
    "/api/v1/catalogue/programs/",
    { q: query },
    limit,
    signal,
  );

export interface InstitutionSearchRow {
  id: string;
  name: string;
  common_name: string;
  country: { id: string; name: string };
}

export const searchInstitutions = (
  query: string,
  limit: number,
  signal?: AbortSignal,
) =>
  searchList<InstitutionSearchRow>(
    "/api/v1/catalogue/institutions/",
    { q: query },
    limit,
    signal,
  );

// ── Documents ────────────────────────────────────────────────────────────────
//
// `?search=` matches the document **label only** — not the body, not the
// applicant's name, not `template_key`.

export interface DocumentSearchRow {
  id: string;
  label: string;
  applicant: string | null;
  applicant_name: string | null;
  is_standalone: boolean;
  status: DocumentStatus;
  /** Present on every list row — needed to drop bank families for a scoped viewer. */
  family: DocumentFamily;
}

export const searchDocuments = (
  query: string,
  limit: number,
  signal?: AbortSignal,
) =>
  searchList<DocumentSearchRow>(
    "/api/v1/documents/",
    { search: query },
    limit,
    signal,
  );

// ── Checklist templates ──────────────────────────────────────────────────────
//
// `?search=` matches `label` or `key`.

export interface ChecklistTemplateSearchRow {
  id: string;
  key: string;
  label: string;
  country: { id: string; name: string } | null;
  status: TemplateStatus;
}

export const searchChecklistTemplates = (
  query: string,
  limit: number,
  signal?: AbortSignal,
) =>
  searchList<ChecklistTemplateSearchRow>(
    "/api/v1/checklists/templates/",
    { search: query },
    limit,
    signal,
  );

// ── Signatories (document templates) ─────────────────────────────────────────
//
// `?search=` runs on the single `name`. Restricted to active signatories: a
// retired one is not a thing anyone can act on from search.

export interface SignatorySearchRow {
  id: string;
  name: string;
  title?: string;
}

export const searchSignatories = (
  query: string,
  limit: number,
  signal?: AbortSignal,
) =>
  searchList<SignatorySearchRow>(
    "/api/v1/document-templates/signatories/",
    { search: query, status: "active" },
    limit,
    signal,
  );
