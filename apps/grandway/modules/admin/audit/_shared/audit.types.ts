/**
 * Grandway `audit` app shapes. Source of truth: `docs/backend/audit/INTEGRATION.md`
 * §4–5 (v1.0.0). Read-only — there is no write API (events are appended only by other
 * apps via an internal service call).
 */

export type AuditActorType =
  | "superadmin"
  | "admin"
  | "lead_manager"
  | "system"
  | "ai";

export interface AuditChange {
  old: unknown;
  new: unknown;
}

/** `GET /api/v1/audit/events/` and `.../<id>/` — API §4. */
export interface AuditEvent {
  id: string;
  actor_type: AuditActorType;
  actor_id: string | null;
  actor_label: string;
  app_label: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  reason: string;
  source: string;
  ip_address: string | null;
  success: boolean;
  summary: string;
  /** Compact before/after map, `{}` by default — API §4. */
  changes: Record<string, AuditChange>;
  /** Open, non-secret bag — AI provenance for `actor_type: "ai"`. */
  metadata: Record<string, unknown>;
  created_at: string;
}

/** Exact-match, AND-combined query filters — the only ones the endpoint supports (§3). */
export interface AuditEventFilters {
  app?: string;
  action?: string;
  actor_type?: AuditActorType;
  actor_id?: string;
  entity_type?: string;
  entity_id?: string;
  success?: boolean;
  fiscal_year?: string;
}
