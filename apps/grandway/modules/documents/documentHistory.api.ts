import api from "@/lib/api";
import type {
  BsDate,
  DocumentContent,
  DocumentFamily,
} from "./documents.types";
import type {
  CaptureSnapshotInput,
  DocumentPrintEvent,
  DocumentSnapshot,
  DocumentSnapshotDetail,
  PrintEventType,
} from "./documentHistory.types";

// ── Backend wire shapes ─────────────────────────────────────────────────────

interface RawSnapshot {
  id: string;
  document: string;
  version_number: number;
  family: DocumentFamily;
  template_key: string;
  label: string;
  capture_note: string;
  captured_by_username: string;
  created_at: string;
  created_at_bs: BsDate | null;
}

interface RawSnapshotDetail extends RawSnapshot {
  content: DocumentContent;
  render_context: Record<string, unknown>;
}

interface RawPrintEvent {
  id: string;
  snapshot: string;
  document: string;
  version_number: number;
  label: string;
  event_type: PrintEventType;
  note: string;
  performed_by_username: string;
  created_at: string;
  created_at_bs: BsDate | null;
}

type ListEnvelope<T> = {
  data: T[];
  meta: { count: number } & Record<string, unknown>;
};

// ── Mappers ─────────────────────────────────────────────────────────────────

function mapSnapshot(raw: RawSnapshot): DocumentSnapshot {
  return {
    id: raw.id,
    documentId: raw.document,
    versionNumber: raw.version_number,
    family: raw.family,
    templateKey: raw.template_key,
    label: raw.label,
    captureNote: raw.capture_note,
    capturedByUsername: raw.captured_by_username,
    createdAt: raw.created_at,
    createdAtBs: raw.created_at_bs,
  };
}

function mapSnapshotDetail(raw: RawSnapshotDetail): DocumentSnapshotDetail {
  return {
    ...mapSnapshot(raw),
    content: raw.content,
    renderContext: raw.render_context ?? {},
  };
}

function mapPrintEvent(raw: RawPrintEvent): DocumentPrintEvent {
  return {
    id: raw.id,
    snapshotId: raw.snapshot,
    documentId: raw.document,
    versionNumber: raw.version_number,
    label: raw.label,
    eventType: raw.event_type,
    note: raw.note,
    performedByUsername: raw.performed_by_username,
    createdAt: raw.created_at,
    createdAtBs: raw.created_at_bs,
  };
}

const BASE = "/api/v1/document-history";

export const documentHistoryApi = {
  /** `GET /document-history/documents/<id>/snapshots/` — version chain, newest-version first. */
  async listSnapshots(documentId: string): Promise<DocumentSnapshot[]> {
    const { data } = await api.get<ListEnvelope<RawSnapshot>>(
      `${BASE}/documents/${documentId}/snapshots/`,
      { params: { page: 1, page_size: 100 } },
    );
    return data.data.map(mapSnapshot);
  },

  /** `GET /document-history/snapshots/<id>/` — the full frozen record (body + render context). */
  async getSnapshot(snapshotId: string): Promise<DocumentSnapshotDetail> {
    const { data } = await api.get<RawSnapshotDetail>(
      `${BASE}/snapshots/${snapshotId}/`,
    );
    return mapSnapshotDetail(data);
  },

  /**
   * `POST /document-history/documents/<id>/snapshots/` → 201. Captures an immutable snapshot;
   * `content` is copied from the committed document row (no `content` in the body). Does not
   * change the document's status or `updated_at`.
   */
  async capture(
    documentId: string,
    input: CaptureSnapshotInput,
  ): Promise<DocumentSnapshotDetail> {
    const { data } = await api.post<RawSnapshotDetail>(
      `${BASE}/documents/${documentId}/snapshots/`,
      {
        render_context: input.renderContext,
        ...(input.captureNote ? { capture_note: input.captureNote } : {}),
      },
    );
    return mapSnapshotDetail(data);
  },

  /**
   * `POST /document-history/snapshots/<id>/recover/` — writes the snapshot's label + content
   * forward into the working document. Returns the updated `documents` Document (the caller
   * refetches the document rather than trusting a cached copy); 409 if the target is archived.
   */
  async recover(snapshotId: string, note?: string): Promise<void> {
    await api.post(
      `${BASE}/snapshots/${snapshotId}/recover/`,
      note ? { note } : {},
    );
  },

  /** `GET /document-history/documents/<id>/timeline/` — all print events, newest first. */
  async listTimeline(documentId: string): Promise<DocumentPrintEvent[]> {
    const { data } = await api.get<ListEnvelope<RawPrintEvent>>(
      `${BASE}/documents/${documentId}/timeline/`,
      { params: { page: 1, page_size: 100 } },
    );
    return data.data.map(mapPrintEvent);
  },

  /** `POST /document-history/snapshots/<id>/reprint/` → 201 PrintEvent; no new snapshot. */
  async reprint(
    snapshotId: string,
    note?: string,
  ): Promise<DocumentPrintEvent> {
    const { data } = await api.post<RawPrintEvent>(
      `${BASE}/snapshots/${snapshotId}/reprint/`,
      note ? { note } : {},
    );
    return mapPrintEvent(data);
  },
};
