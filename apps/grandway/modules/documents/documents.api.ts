import api from "@/lib/api";
import type {
  BsDate,
  CreateDocumentInput,
  Document,
  DocumentContent,
  DocumentFamily,
  DocumentHistoryEvent,
  DocumentListItem,
  DocumentStatusValue,
  DocumentType,
  DocumentWorkspaceSummary,
  Signature,
  StudentFullData,
  UpdateDocumentInput,
} from "./documents.types";

// ── Backend wire shapes (snake_case) ────────────────────────────────────────

interface RawDocumentDetail {
  id: string;
  applicant: string | null;
  applicant_name: string | null;
  is_standalone: boolean;
  standalone_purpose: string;
  family: DocumentFamily;
  template_key: string;
  label: string;
  content: DocumentContent;
  status: Document["status"];
  notes: string;
  is_editable: boolean;
  is_archived: boolean;
  archive_reason: string;
  archived_at: string | null;
  archived_at_bs: BsDate | null;
  archived_by_username: string | null;
  created_by_username: string;
  created_at: string;
  updated_at: string;
}

type RawDocumentListItem = Pick<
  RawDocumentDetail,
  | "id"
  | "applicant"
  | "applicant_name"
  | "is_standalone"
  | "family"
  | "template_key"
  | "label"
  | "status"
  | "is_archived"
  | "created_at"
  | "updated_at"
>;

interface RawWorkspace {
  applicant_id: string;
  applicant_name: string;
  document_count: number;
  last_updated: string;
}

interface RawHistoryEvent {
  id: string;
  action: DocumentHistoryEvent["action"];
  actor_type: string;
  actor_id: string | null;
  actor_label: string;
  summary: string;
  reason: string;
  changes: Record<string, { from: string; to: string }>;
  metadata: Record<string, unknown>;
  created_at: string;
  created_at_bs: BsDate | null;
}

interface RawSignatory {
  id: string;
  name: string;
  title: string;
  role: string;
  signature_image_url: string;
  status: string;
  is_active: boolean;
}

interface RawTemplate {
  id: string;
  key: string;
  family: DocumentFamily;
  label: string;
  description: string;
  display_order: number;
  status: string;
  is_active: boolean;
}

interface RawApplicantSummary {
  id: string;
  full_name?: string;
  email?: string;
  nationality?: string;
  created_at?: string;
  contact_numbers?: Array<{ contact_number?: string }>;
}

type ListEnvelope<T> = {
  data: T[];
  meta: { count: number } & Record<string, unknown>;
};

/** Frontend list response: items + a normalized `total` (from `meta.count`). */
export interface DocumentsListResult<T> {
  data: T[];
  total: number;
}

// ── Mappers (snake_case → app-native camelCase) ─────────────────────────────

function mapDocument(raw: RawDocumentDetail): Document {
  return {
    id: raw.id,
    applicantId: raw.applicant,
    applicantName: raw.applicant_name,
    isStandalone: raw.is_standalone,
    standalonePurpose: raw.standalone_purpose,
    family: raw.family,
    type: raw.template_key as DocumentType,
    templateKey: raw.template_key,
    label: raw.label,
    content: raw.content,
    status: raw.status,
    notes: raw.notes,
    isEditable: raw.is_editable,
    isArchived: raw.is_archived,
    archiveReason: raw.archive_reason,
    archivedAt: raw.archived_at,
    archivedAtBs: raw.archived_at_bs,
    archivedByUsername: raw.archived_by_username,
    createdByUsername: raw.created_by_username,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

function mapListItem(raw: RawDocumentListItem): DocumentListItem {
  return {
    id: raw.id,
    applicantId: raw.applicant,
    applicantName: raw.applicant_name,
    isStandalone: raw.is_standalone,
    family: raw.family,
    templateKey: raw.template_key,
    type: raw.template_key as DocumentType,
    label: raw.label,
    status: raw.status,
    isArchived: raw.is_archived,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

function mapWorkspace(raw: RawWorkspace): DocumentWorkspaceSummary {
  return {
    applicantId: raw.applicant_id,
    applicantName: raw.applicant_name,
    documentCount: raw.document_count,
    lastUpdated: raw.last_updated,
  };
}

function mapHistoryEvent(raw: RawHistoryEvent): DocumentHistoryEvent {
  return {
    id: raw.id,
    action: raw.action,
    actorType: raw.actor_type,
    actorId: raw.actor_id,
    actorLabel: raw.actor_label,
    summary: raw.summary,
    reason: raw.reason,
    changes: raw.changes ?? {},
    metadata: raw.metadata ?? {},
    createdAt: raw.created_at,
    createdAtBs: raw.created_at_bs,
  };
}

function mapSignatory(raw: RawSignatory): Signature {
  return {
    id: raw.id,
    name: raw.name,
    signature_image: raw.signature_image_url ?? "",
    is_active: raw.is_active,
    title: raw.title,
    role: raw.role,
    has_image: Boolean(raw.signature_image_url),
  };
}

// ── Query params for the documents list ─────────────────────────────────────

export interface DocumentListParams {
  applicant?: string;
  standalone?: boolean;
  status?: Document["status"];
  family?: DocumentFamily;
  templateKey?: string;
  search?: string;
  fiscalYear?: string;
  page?: number;
  pageSize?: number;
}

function toListServerParams(
  params: DocumentListParams,
): Record<string, unknown> {
  const out: Record<string, unknown> = {
    page: params.page ?? 1,
    page_size: params.pageSize ?? 20,
  };
  if (params.applicant) out.applicant = params.applicant;
  if (typeof params.standalone === "boolean")
    out.standalone = params.standalone;
  if (params.status) out.status = params.status;
  if (params.family) out.family = params.family;
  if (params.templateKey) out.template_key = params.templateKey;
  if (params.search) out.search = params.search;
  if (params.fiscalYear) out.fiscal_year = params.fiscalYear;
  return out;
}

// ── Request-body builders (only the fields the backend accepts) ──────────────

function toCreateBody(input: CreateDocumentInput): Record<string, unknown> {
  const body: Record<string, unknown> = {
    family: input.family,
    template_key: input.templateKey,
    label: input.label,
  };
  if (input.applicantId) body.applicant = input.applicantId;
  else if (input.standalonePurpose)
    body.standalone_purpose = input.standalonePurpose;
  if (input.content) body.content = input.content;
  if (input.notes !== undefined) body.notes = input.notes;
  return body;
}

function toUpdateBody(input: UpdateDocumentInput): Record<string, unknown> {
  // Only label/content/standalone_purpose/notes are accepted — anything else 400s the
  // whole request. `content` replaces WHOLESALE (not merged): callers send the complete body.
  const body: Record<string, unknown> = {};
  if (input.label !== undefined) body.label = input.label;
  if (input.content !== undefined) body.content = input.content;
  if (input.standalonePurpose !== undefined)
    body.standalone_purpose = input.standalonePurpose;
  if (input.notes !== undefined) body.notes = input.notes;
  return body;
}

// ── API surface ─────────────────────────────────────────────────────────────

export const documentsApi = {
  /** `GET /api/v1/documents/` — list shape (no `content`). */
  async list(
    params: DocumentListParams,
  ): Promise<DocumentsListResult<DocumentListItem>> {
    const { data } = await api.get<ListEnvelope<RawDocumentListItem>>(
      "/api/v1/documents/",
      { params: toListServerParams(params) },
    );
    return { data: data.data.map(mapListItem), total: data.meta.count };
  },

  /** `GET /api/v1/documents/?applicant=<id>` — a single applicant's document workspace. */
  async listByApplicant(applicantId: string): Promise<DocumentListItem[]> {
    const { data } = await api.get<ListEnvelope<RawDocumentListItem>>(
      "/api/v1/documents/",
      { params: { applicant: applicantId, page: 1, page_size: 100 } },
    );
    return data.data.map(mapListItem);
  },

  /** `GET /api/v1/documents/<id>/` — the only endpoint that returns `content`. */
  async get(id: string): Promise<Document> {
    const { data } = await api.get<RawDocumentDetail>(
      `/api/v1/documents/${id}/`,
    );
    return mapDocument(data);
  },

  /** `POST /api/v1/documents/` → 201, detail shape. */
  async create(input: CreateDocumentInput): Promise<Document> {
    const { data } = await api.post<RawDocumentDetail>(
      "/api/v1/documents/",
      toCreateBody(input),
    );
    return mapDocument(data);
  },

  /** `PATCH /api/v1/documents/<id>/` — `content` replaces wholesale; immutable fields rejected. */
  async update(id: string, input: UpdateDocumentInput): Promise<Document> {
    const { data } = await api.patch<RawDocumentDetail>(
      `/api/v1/documents/${id}/`,
      toUpdateBody(input),
    );
    return mapDocument(data);
  },

  /** `POST /api/v1/documents/<id>/status/` — `draft`/`ready` only. */
  async changeStatus(
    id: string,
    status: DocumentStatusValue,
  ): Promise<Document> {
    const { data } = await api.post<RawDocumentDetail>(
      `/api/v1/documents/${id}/status/`,
      { status },
    );
    return mapDocument(data);
  },

  /** `POST /api/v1/documents/<id>/archive/` — reason mandatory. This is the delete button. */
  async archive(id: string, reason: string): Promise<Document> {
    const { data } = await api.post<RawDocumentDetail>(
      `/api/v1/documents/${id}/archive/`,
      { reason },
    );
    return mapDocument(data);
  },

  /** `POST /api/v1/documents/<id>/restore/` — always returns to `draft`. */
  async restore(id: string): Promise<Document> {
    const { data } = await api.post<RawDocumentDetail>(
      `/api/v1/documents/${id}/restore/`,
      {},
    );
    return mapDocument(data);
  },

  /** `GET /api/v1/documents/workspaces/` — one row per applicant with live docs. */
  async listWorkspaces(
    page = 1,
    pageSize = 100,
  ): Promise<DocumentsListResult<DocumentWorkspaceSummary>> {
    const { data } = await api.get<ListEnvelope<RawWorkspace>>(
      "/api/v1/documents/workspaces/",
      { params: { page, page_size: pageSize } },
    );
    return { data: data.data.map(mapWorkspace), total: data.meta.count };
  },

  /** `GET /api/v1/documents/<id>/history/` — paginated audit events, newest first. */
  async listHistory(
    id: string,
    pageSize = 100,
  ): Promise<DocumentsListResult<DocumentHistoryEvent>> {
    const { data } = await api.get<ListEnvelope<RawHistoryEvent>>(
      `/api/v1/documents/${id}/history/`,
      { params: { page: 1, page_size: pageSize } },
    );
    return { data: data.data.map(mapHistoryEvent), total: data.meta.count };
  },

  /**
   * `GET /api/v1/document-templates/signatories/?status=active` — the advisory signatory
   * library; the only guard on a document's `instructorId`/`directorId` (`INTEGRATION.md` §9).
   */
  async listActiveSignatories(): Promise<Signature[]> {
    const { data } = await api.get<ListEnvelope<RawSignatory>>(
      "/api/v1/document-templates/signatories/",
      { params: { status: "active", page_size: 100 } },
    );
    return data.data.map(mapSignatory);
  },

  /**
   * `GET /api/v1/document-templates/templates/?status=active` — the advisory template
   * catalogue; the only guard on which `template_key`s a user can create.
   */
  async listActiveTemplates(): Promise<DocumentCatalogTemplate[]> {
    const { data } = await api.get<ListEnvelope<RawTemplate>>(
      "/api/v1/document-templates/templates/",
      { params: { status: "active", page_size: 100 } },
    );
    return data.data.map((t) => ({
      id: t.id,
      key: t.key,
      family: t.family,
      label: t.label,
      description: t.description,
      displayOrder: t.display_order,
    }));
  },

  /**
   * `GET /api/v1/applicants/<id>/` — mapped to the template-native `StudentFullData` the
   * CV/certificate adapters read. Grandway's applicants carry no program/summary/skills yet
   * (`INTEGRATION.md` §9 reconciliation), so those are left blank rather than guessed.
   */
  async fetchApplicantSummary(applicantId: string): Promise<StudentFullData> {
    const { data } = await api.get<RawApplicantSummary>(
      `/api/v1/applicants/${applicantId}/`,
    );
    return {
      id: data.id,
      fullName: data.full_name ?? "",
      email: data.email ?? "",
      phone: data.contact_numbers?.[0]?.contact_number ?? "",
      program: "",
      nationality: data.nationality ?? "",
      enrolledAt: data.created_at ?? "",
    };
  },
};

/** A picker-facing active template row (from the `document_templates` catalogue). */
export interface DocumentCatalogTemplate {
  id: string;
  key: string;
  family: DocumentFamily;
  label: string;
  description: string;
  displayOrder: number;
}
