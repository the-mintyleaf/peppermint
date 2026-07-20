import api from "@/lib/api";
import type {
  CreateDocumentInput,
  CreatePrintEventInput,
  Document,
  DocumentPrefill,
  DocumentRevision,
  DocumentStatusAction,
  DocumentType,
  DocumentWorkspaceSummary,
  PrintEvent,
  Signature,
  SignatureInput,
  StudentFullData,
  UpdateDocumentInput,
} from "./documents.types";

// ── Slug mapping (§document-schemas §31) ─────────────────────────────────────
// The frontend keeps legacy `student-*` slugs (template folders); the backend registry uses
// `applicant-*`. The other 49 slugs are identical, so we translate only these four.
const FE_TO_BE_SLUG: Partial<Record<string, string>> = {
  "student-certificate": "applicant-certificate",
  "student-cv": "applicant-cv",
  "student-cv-standard": "applicant-cv-standard",
  "student-cv-extended": "applicant-cv-extended",
};
const BE_TO_FE_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(FE_TO_BE_SLUG).map(([fe, be]) => [be, fe]),
);

function toBackendType(type: DocumentType): string {
  return FE_TO_BE_SLUG[type] ?? type;
}
function toFrontendType(type: string): DocumentType {
  return (BE_TO_FE_SLUG[type] ?? type) as DocumentType;
}

// ── Envelope helpers ─────────────────────────────────────────────────────────
// The api-client unwraps `{ success, data, meta }`: paginated lists keep `{ data, meta }`,
// everything else unwraps to the payload. `unwrapList` tolerates both shapes.
function unwrapList<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  const maybe = (raw as { data?: unknown } | null)?.data;
  return Array.isArray(maybe) ? (maybe as T[]) : [];
}

// ── Certificate content key mapping ──────────────────────────────────────────
// The certificate template family reads camelCase keys, but the backend `certificate`
// validator requires snake_case (`study_type` is required; `instructor_id`/`director_id`
// drive signature resolution — document-schemas §2). Translate only these keys, only for the
// certificate type; every other family already agrees with the backend (or is open-schema).
const CERT_CAMEL_TO_SNAKE: Record<string, string> = {
  studyType: "study_type",
  coursehour: "course_hours",
  instructorId: "instructor_id",
  directorId: "director_id",
};
const CERT_SNAKE_TO_CAMEL: Record<string, string> = Object.fromEntries(
  Object.entries(CERT_CAMEL_TO_SNAKE).map(([camel, snake]) => [snake, camel]),
);

function remapKeys(
  content: Document["content"],
  map: Record<string, string>,
): Document["content"] {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(content)) {
    out[map[key] ?? key] = value;
  }
  return out as Document["content"];
}

/** Certificate content → backend snake_case on send; no-op for other families. */
function toBackendContent(
  type: DocumentType | undefined,
  content: Document["content"],
): Document["content"] {
  return type === "student-certificate"
    ? remapKeys(content, CERT_CAMEL_TO_SNAKE)
    : content;
}

/** Backend certificate content → camelCase on read; no-op for other families. */
function toFrontendContent(
  type: DocumentType,
  content: Document["content"],
): Document["content"] {
  return type === "student-certificate"
    ? remapKeys(content, CERT_SNAKE_TO_CAMEL)
    : content;
}

// ── Backend → frontend mappers ───────────────────────────────────────────────
interface RawDocument {
  id: string;
  applicant: string | null;
  application_case: string | null;
  document_type: string;
  label: string;
  status: Document["status"];
  document_content: Document["content"] | null;
  schema_version: number;
  current_revision_number: number;
  record_version: number;
  created_at: string;
  updated_at: string;
}

function toDocument(raw: RawDocument): Document {
  const type = toFrontendType(raw.document_type);
  return {
    id: raw.id,
    applicantId: raw.applicant,
    type,
    label: raw.label,
    content: toFrontendContent(
      type,
      (raw.document_content ?? {}) as Document["content"],
    ),
    status: raw.status,
    recordVersion: raw.record_version,
    currentRevisionNumber: raw.current_revision_number,
    schemaVersion: raw.schema_version,
    applicationCaseId: raw.application_case,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

function toRevision(raw: Record<string, unknown>): DocumentRevision {
  const type = toFrontendType(String(raw.document_type_snapshot));
  return {
    id: String(raw.id ?? `${raw.document}-${raw.revision_number}`),
    revisionNumber: Number(raw.revision_number),
    // Revisions store the backend content shape (snake_case for certificates); map it back so
    // previewing/restoring a revision renders through the camelCase-reading templates.
    contentSnapshot: toFrontendContent(
      type,
      (raw.content_snapshot ?? {}) as Document["content"],
    ),
    labelSnapshot: String(raw.label_snapshot ?? ""),
    statusSnapshot: raw.status_snapshot as Document["status"],
    documentTypeSnapshot: type,
    changeReason: (raw.change_reason as string) ?? undefined,
    changedBy: (raw.changed_by as string | null) ?? null,
    createdAt: String(raw.created_at),
  };
}

function toPrintEvent(raw: Record<string, unknown>): PrintEvent {
  return {
    id: String(raw.id),
    documentId: String(raw.document),
    type: toFrontendType(String(raw.document_type)),
    revisionId:
      raw.document_revision != null ? String(raw.document_revision) : null,
    snapshot: {
      contentSnapshot: (raw.content_snapshot ?? undefined) as
        | Document["content"]
        | undefined,
      resolvedApplicantDataSnapshot: raw.resolved_applicant_data_snapshot as
        | Record<string, unknown>
        | undefined,
      derivedValuesSnapshot: raw.derived_values_snapshot as
        | Record<string, unknown>
        | undefined,
      renderConfigSnapshot: raw.render_config_snapshot as
        | Record<string, unknown>
        | undefined,
    },
    printStatus: (raw.print_status as PrintEvent["printStatus"]) ?? "rendered",
    printedAt: String(raw.print_initiated_at ?? raw.created_at),
  };
}

function toSignature(raw: Record<string, unknown>): Signature {
  return {
    id: String(raw.id),
    name: String(raw.name ?? ""),
    signature_image: "",
    is_active: Boolean(raw.is_active),
    title: (raw.title as string) ?? undefined,
    organization: (raw.organization as string) ?? undefined,
    has_image: Boolean(raw.has_image),
  };
}

function toWorkspace(raw: Record<string, unknown>): DocumentWorkspaceSummary {
  return {
    applicantId: String(raw.applicant_id),
    applicantCode: String(raw.applicant_code ?? ""),
    applicantName: String(raw.applicant_name ?? ""),
    documentCount: Number(raw.document_count ?? 0),
    draftCount: Number(raw.draft_count ?? 0),
    finalizedCount: Number(raw.finalized_count ?? 0),
    submittedCount: Number(raw.submitted_count ?? 0),
    lastUpdated: String(raw.last_updated ?? ""),
  };
}

// ── Documents ────────────────────────────────────────────────────────────────
/** `GET /api/v1/applicants/:id/documents/` — the applicant's documents. */
export async function listByApplicant(
  applicantId: string,
): Promise<Document[]> {
  const { data } = await api.get(
    `/api/v1/applicants/${applicantId}/documents/`,
    { params: { page_size: 100 } },
  );
  return unwrapList<RawDocument>(data).map(toDocument);
}

/** `GET /api/v1/documents/:id/`. */
export async function getDocument(documentId: string): Promise<Document> {
  const { data } = await api.get<RawDocument>(
    `/api/v1/documents/${documentId}/`,
  );
  return toDocument(data);
}

/** `POST /api/v1/applicants/:id/documents/` — status defaults to `draft`. */
export async function createDocument(
  input: CreateDocumentInput,
): Promise<Document> {
  const { data } = await api.post<RawDocument>(
    `/api/v1/applicants/${input.applicantId}/documents/`,
    {
      document_type: toBackendType(input.type),
      label: input.label,
      document_content: toBackendContent(input.type, input.content),
      ...(input.applicationCaseId
        ? { application_case_id: input.applicationCaseId }
        : {}),
    },
  );
  return toDocument(data);
}

/** `PATCH /api/v1/documents/:id/` — editable only in draft/ready; needs `record_version`. */
export async function updateDocument(
  documentId: string,
  input: UpdateDocumentInput,
): Promise<Document> {
  const { data } = await api.patch<RawDocument>(
    `/api/v1/documents/${documentId}/`,
    {
      ...(input.label !== undefined ? { label: input.label } : {}),
      ...(input.content !== undefined
        ? { document_content: toBackendContent(input.type, input.content) }
        : {}),
      ...(input.schemaVersion !== undefined
        ? { schema_version: input.schemaVersion }
        : {}),
      record_version: input.recordVersion,
    },
  );
  return toDocument(data);
}

/** `DELETE /api/v1/documents/:id/` — soft-archive. */
export async function removeDocument(documentId: string): Promise<void> {
  await api.delete(`/api/v1/documents/${documentId}/`);
}

/** `POST /api/v1/documents/:id/:action/` — ready | finalize | submit | archive. */
export async function runDocumentAction(
  documentId: string,
  action: DocumentStatusAction,
): Promise<Document> {
  const { data } = await api.post<RawDocument>(
    `/api/v1/documents/${documentId}/${action}/`,
  );
  return toDocument(data);
}

/** `GET /api/v1/applicants/:id/document-prefill/` — reusable applicant data. */
export async function fetchPrefill(
  applicantId: string,
): Promise<DocumentPrefill> {
  const { data } = await api.get<DocumentPrefill>(
    `/api/v1/applicants/${applicantId}/document-prefill/`,
  );
  return data;
}

/** `GET /api/v1/documents/workspaces/` — documents grouped by applicant with status counts. */
export async function listWorkspaces(): Promise<DocumentWorkspaceSummary[]> {
  const { data } = await api.get(`/api/v1/documents/workspaces/`, {
    params: { page_size: 100 },
  });
  return unwrapList<Record<string, unknown>>(data).map(toWorkspace);
}

// ── Revisions ────────────────────────────────────────────────────────────────
/** `GET /api/v1/documents/:id/revisions/` — newest first. */
export async function listRevisions(
  documentId: string,
): Promise<DocumentRevision[]> {
  const { data } = await api.get(`/api/v1/documents/${documentId}/revisions/`, {
    params: { page_size: 100 },
  });
  return unwrapList<Record<string, unknown>>(data).map(toRevision);
}

/** `POST /api/v1/documents/:id/revisions/:n/restore/` — appends a new revision. */
export async function restoreRevision(
  documentId: string,
  revisionNumber: number,
): Promise<Document> {
  const { data } = await api.post<RawDocument>(
    `/api/v1/documents/${documentId}/revisions/${revisionNumber}/restore/`,
  );
  return toDocument(data);
}

// ── Print events ─────────────────────────────────────────────────────────────
/** `GET /api/v1/documents/:id/print-events/` — retained after archival. */
export async function listPrintEvents(
  documentId: string,
): Promise<PrintEvent[]> {
  const { data } = await api.get(
    `/api/v1/documents/${documentId}/print-events/`,
    { params: { page_size: 100 } },
  );
  return unwrapList<Record<string, unknown>>(data).map(toPrintEvent);
}

/** `POST /api/v1/documents/:id/print-events/` — derived values stored verbatim. */
export async function createPrintEvent(
  documentId: string,
  input: CreatePrintEventInput,
): Promise<PrintEvent> {
  const { data } = await api.post<Record<string, unknown>>(
    `/api/v1/documents/${documentId}/print-events/`,
    {
      ...(input.revisionNumber != null
        ? { revision_number: input.revisionNumber }
        : {}),
      ...(input.contentSnapshot !== undefined
        ? { content_snapshot: input.contentSnapshot }
        : {}),
      ...(input.derivedValuesSnapshot !== undefined
        ? { derived_values_snapshot: input.derivedValuesSnapshot }
        : {}),
      ...(input.renderConfigSnapshot !== undefined
        ? { render_config_snapshot: input.renderConfigSnapshot }
        : {}),
      ...(input.templateKey ? { template_key: input.templateKey } : {}),
      ...(input.templateVersion
        ? { template_version: input.templateVersion }
        : {}),
      print_status: input.printStatus ?? "rendered",
    },
  );
  return toPrintEvent(data);
}

// ── Signatures ───────────────────────────────────────────────────────────────
/** `GET /api/v1/signatures/?active=true`. */
export async function listSignatures(activeOnly = true): Promise<Signature[]> {
  const { data } = await api.get(`/api/v1/signatures/`, {
    params: { ...(activeOnly ? { active: true } : {}), page_size: 100 },
  });
  return unwrapList<Record<string, unknown>>(data).map(toSignature);
}

/** `GET /api/v1/signatures/:id/image/` — streams private image bytes. */
export async function fetchSignatureImageBlob(
  signatureId: string,
): Promise<Blob> {
  const { data } = await api.get<Blob>(
    `/api/v1/signatures/${signatureId}/image/`,
    { responseType: "blob" },
  );
  return data;
}

function toSignatureFormData(input: SignatureInput): FormData {
  const fd = new FormData();
  fd.append("name", input.name);
  if (input.title !== undefined) fd.append("title", input.title);
  if (input.organization !== undefined)
    fd.append("organization", input.organization);
  if (input.email !== undefined) fd.append("email", input.email);
  if (input.phone !== undefined) fd.append("phone", input.phone);
  if (input.isActive !== undefined)
    fd.append("is_active", String(input.isActive));
  if (input.validFrom !== undefined) fd.append("valid_from", input.validFrom);
  if (input.validTo !== undefined) fd.append("valid_to", input.validTo);
  if (input.imageFile) fd.append("signature_image", input.imageFile);
  return fd;
}

// Override the client's default JSON Content-Type so axios sends multipart with a boundary
// (otherwise it JSON-stringifies the FormData and drops the file). Mirrors evidenceMedia.api.ts.
const MULTIPART = { headers: { "Content-Type": "multipart/form-data" } };

/** `POST /api/v1/signatures/` — multipart. */
export async function createSignature(
  input: SignatureInput,
): Promise<Signature> {
  const { data } = await api.post<Record<string, unknown>>(
    `/api/v1/signatures/`,
    toSignatureFormData(input),
    MULTIPART,
  );
  return toSignature(data);
}

/** `PATCH /api/v1/signatures/:id/` — multipart; replaces image when provided. */
export async function updateSignature(
  signatureId: string,
  input: SignatureInput,
): Promise<Signature> {
  const { data } = await api.patch<Record<string, unknown>>(
    `/api/v1/signatures/${signatureId}/`,
    toSignatureFormData(input),
    MULTIPART,
  );
  return toSignature(data);
}

/** `DELETE /api/v1/signatures/:id/` — deactivates (retained for history). */
export async function deactivateSignature(signatureId: string): Promise<void> {
  await api.delete(`/api/v1/signatures/${signatureId}/`);
}

// ── Prefill → template summary ───────────────────────────────────────────────
/**
 * Map the raw prefill bag into the template-native `StudentFullData` summary the CV /
 * certificate adapters read. Missing fields collapse to empty strings.
 */
export function prefillToSummary(
  applicantId: string,
  prefill: DocumentPrefill | null,
): StudentFullData | null {
  if (!prefill) return null;
  const p = prefill as Record<string, unknown>;
  const str = (v: unknown): string => (typeof v === "string" ? v : "");
  const fullName =
    str(p.full_name) ||
    [p.first_name, p.middle_name, p.last_name]
      .map(str)
      .filter(Boolean)
      .join(" ");
  const interest = (p.interest_profile ?? {}) as Record<string, unknown>;
  return {
    id: applicantId,
    fullName,
    email: str(p.primary_email),
    phone: str(p.primary_phone),
    program: str(interest.target_program),
    nationality: str(p.nationality),
    enrolledAt: str(p.registered_at),
    summary: str(p.summary) || undefined,
    skills: undefined,
    experience: undefined,
  };
}

export const documentsApi = {
  listByApplicant,
  get: getDocument,
  create: createDocument,
  update: updateDocument,
  remove: removeDocument,
  runAction: runDocumentAction,
  fetchPrefill,
  listWorkspaces,
  listRevisions,
  restoreRevision,
  listPrintEvents,
  createPrintEvent,
  listSignatures,
  fetchSignatureImageBlob,
  createSignature,
  updateSignature,
  deactivateSignature,
  prefillToSummary,
};
