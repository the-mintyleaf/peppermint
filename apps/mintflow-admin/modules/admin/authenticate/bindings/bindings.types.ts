import type { ScopeType } from "@/modules/admin/authenticate/_shared/authenticate.types";

export type RoleBindingStatus = "active" | "revoked" | "expired";

export interface RoleBinding {
  id: string;
  subject_user: string;
  role: string;
  scope_type: ScopeType;
  organization: string | null;
  organization_unit: string | null;
  valid_from: string | null;
  valid_until: string | null;
  status: RoleBindingStatus;
  assigned_by: string | null;
  assignment_reason: string | null;
  revoked_at: string | null;
  revoked_by: string | null;
  revocation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoleBindingsFetchResponse {
  data: RoleBinding[];
  meta: { total: number; count?: number };
}
