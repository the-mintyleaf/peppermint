import type { QueryKey } from "@peppermint/ui";

/**
 * The two categories the notes panel draws as tabs. The backend may add more
 * values later (e.g. `call`); a note carrying one is still rendered — its
 * category is shown as the raw string — but it gets no tab of its own.
 */
export type NoteTabCategory = "general" | "visit";

/** A note category as the API returns it: a known tab value or a future one. */
export type NoteCategory = NoteTabCategory | (string & {});

/** `ordering` values both notes endpoints accept. `-noted_at` is the default. */
export type NoteOrdering = "-noted_at" | "noted_at" | "-created_at";

/** Structural subset of `UserBrief` the panel reads. */
export interface NoteUserBrief {
  id: string;
  username: string;
  display_name: string;
}

/** Structural subset of `BsDate` the panel reads (only `display` is drawn). */
export interface NoteBsDate {
  display: string;
}

/**
 * The note shape the panel renders — a structural subset of both `LeadNote`
 * and `ApplicantNote`, so each module can return its own type unmapped.
 * `source_lead_id` exists only on applicant notes.
 */
export interface NotesPanelNote {
  id: string;
  category: NoteCategory;
  body: string;
  /** ISO 8601 UTC — when it happened (may be backdated). */
  noted_at: string;
  noted_at_bs?: NoteBsDate | null;
  is_backdated: boolean;
  author: NoteUserBrief;
  updated_by?: NoteUserBrief | null;
  source_lead_id?: string | null;
  /** ISO 8601 UTC — when it was saved. */
  created_at: string;
  updated_at: string;
}

/** Params the panel passes to `adapter.list`. */
export interface NotesListParams {
  category: NoteTabCategory;
  ordering: NoteOrdering;
  /** 1-based. */
  page: number;
  pageSize: number;
}

/** Per-category live-note counts — `meta.counts` on every list response. */
export type NoteCounts = { general: number; visit: number } & Record<
  string,
  number
>;

/**
 * Normalised list result the adapter must return. Map it from the raw body:
 * `data` → `data`, `meta.count` → `total`, `meta.counts` → `counts`.
 */
export interface NotesListResult<
  TNote extends NotesPanelNote = NotesPanelNote,
> {
  data: TNote[];
  /** `meta.count` — notes matching the `category` filter. */
  total: number;
  counts: NoteCounts;
}

/** `POST` body. `noted_at` omitted = "now" (the server's default). */
export interface NoteCreatePayload {
  category: NoteCategory;
  body: string;
  /** ISO 8601 WITH a UTC offset, e.g. `2026-07-22T15:15:00+05:45`. */
  noted_at?: string;
}

/** `PATCH` body — only the fields that changed. */
export type NoteUpdatePayload = Partial<{
  category: NoteCategory;
  body: string;
  noted_at: string;
}>;

/**
 * The per-owner API surface a host module supplies. Every function is already
 * bound to the owner (the lead or applicant id) — the panel never builds a URL.
 *
 * `queryKey` is the base the panel appends its list params to and invalidates
 * (prefix match) after every write, e.g.
 * `[...leadManagementQueryKeys.detail(leadId), "notes"]`.
 */
export interface NotesAdapter<TNote extends NotesPanelNote = NotesPanelNote> {
  queryKey: QueryKey;
  list: (params: NotesListParams) => Promise<NotesListResult<TNote>>;
  create: (payload: NoteCreatePayload) => Promise<TNote>;
  update: (noteId: string, payload: NoteUpdatePayload) => Promise<TNote>;
  remove: (noteId: string) => Promise<void>;
  /** Extra keys invalidated after a successful write (e.g. the History tab). */
  invalidateKeys?: QueryKey[];
}

export interface NotesPanelProps<
  TNote extends NotesPanelNote = NotesPanelNote,
> {
  adapter: NotesAdapter<TNote>;
  /** The signed-in user's id — edit/delete show on notes they authored. */
  currentUserId: string | null | undefined;
  /** True only for an Admin account — edit/delete show on every note. */
  isAdmin: boolean;
  /**
   * When set, the panel is read-only: no composer, no edit/delete, and this
   * text explains why (converted lead, deleted lead, archived applicant).
   */
  readOnlyReason?: string;
  /** The record noun used in copy ("lead", "applicant"). Defaults to "record". */
  subjectLabel?: string;
  /** Notes per page. Defaults to 20 (backend max 100). */
  pageSize?: number;
  /**
   * Fired when a write is refused with 409 (the record was converted, deleted,
   * or archived since it loaded) — refetch the record so `readOnlyReason`
   * follows. The notes list is invalidated by the panel itself.
   */
  onWriteConflict?: (error: unknown) => void;
  /** z-index for the date-time picker's popover when hosted in a raised layer. */
  popoverZIndex?: number;
}

/** Values of the composer / in-place editor form (FormWrapper). */
export type NoteFormValues = {
  body: string;
  /**
   * Local wall-clock `YYYY-MM-DD HH:mm:ss` from the picker. `null` in the
   * composer means "now" — the server stamps it at save time, so a note that
   * took 20 minutes to write is not flagged as backdated.
   */
  noted_at: string | null;
  category: NoteCategory;
};
