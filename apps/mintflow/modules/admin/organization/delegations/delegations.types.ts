import type { DelegationType, DelegationStatus } from "../organization.types";

export type { DelegationType, DelegationStatus };

export interface Delegation extends Record<string, unknown> {
  id: string;
  organization: string;
  from_assignment: string;
  to_assignment: string;
  from_assignment_label?: string;
  to_assignment_label?: string;
  delegation_type: DelegationType;
  status: DelegationStatus;
  scope_unit: string | null;
  starts_at: string;
  ends_at: string | null;
  reason: string;
  approved_by: string | null;
  revoked_by: string | null;
  revoked_at: string | null;
  revocation_reason: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DelegationsFetchResponse {
  data: Delegation[];
  meta: { total: number; page: number; pageSize: number };
}

export interface DelegationCreatePayload {
  from_assignment_id: string;
  to_assignment_id: string;
  delegation_type: DelegationType;
  status?: DelegationStatus;
  scope_unit?: string | null;
  starts_at: string;
  ends_at?: string | null;
  reason: string;
}

export interface RevokePayload {
  reason: string;
}

export interface AssignmentOption {
  id: string;
  title: string;
  code: string;
  unitName?: string;
  unitId?: string;
}
