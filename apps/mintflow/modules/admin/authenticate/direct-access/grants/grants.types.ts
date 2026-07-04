import type {
  PermissionUserRef,
  ScopeType,
} from "../../_shared/authenticate.types";

export type GrantStatus = "active" | "revoked" | "expired";

export interface Grant extends Record<string, unknown> {
  id: string;
  subject_user: PermissionUserRef | null;
  permission_key: string;
  scope_type: ScopeType;
  organization: string | null;
  organization_unit: string | null;
  valid_from: string | null;
  valid_until: string | null;
  reason: string | null;
  approved_by: PermissionUserRef | null;
  created_by: PermissionUserRef | null;
  status: GrantStatus;
  revoked_at: string | null;
  revoked_by: PermissionUserRef | null;
  revocation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface GrantsFetchResponse {
  data: Grant[];
  meta: { total: number };
}

/** Body for `POST /api/v1/permissions/grants/`. `reason` and `approved_by`
 * are optional — grants are additive, no client-side duplicate prevention. */
export interface GrantCreatePayload {
  subject_user_id: string;
  permission_key: string;
  scope_type: ScopeType;
  organization: string | null;
  organization_unit: string | null;
  reason?: string;
  approved_by?: string | null;
}
