import type {
  PermissionUserRef,
  ScopeType,
} from "../../_shared/authenticate.types";

export type DenialStatus = "active" | "revoked" | "expired";
export type DenialSeverity = "low" | "medium" | "high" | "critical";

export interface Denial extends Record<string, unknown> {
  id: string;
  subject_user: PermissionUserRef | null;
  permission_key: string;
  scope_type: ScopeType;
  organization: string | null;
  organization_unit: string | null;
  reason: string;
  severity: DenialSeverity;
  valid_from: string | null;
  valid_until: string | null;
  created_by: PermissionUserRef | null;
  status: DenialStatus;
  revoked_at: string | null;
  revoked_by: PermissionUserRef | null;
  revocation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface DenialsFetchResponse {
  data: Denial[];
  meta: { total: number };
}

/** Body for `POST /api/v1/permissions/denials/`. Unlike grants, `reason` is
 * required and must be non-blank. */
export interface DenialCreatePayload {
  subject_user_id: string;
  permission_key: string;
  scope_type: ScopeType;
  organization: string | null;
  organization_unit: string | null;
  reason: string;
  severity: DenialSeverity;
}
