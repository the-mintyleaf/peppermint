export interface AccessCheckRequest {
  permission_key: string;
  subject_user_id: string;
  organization_id: string | null;
  organization_unit_id: string | null;
}

export type AccessDecisionRiskLevel = "low" | "medium" | "high" | "critical";

export interface AccessDecision {
  allowed: boolean;
  decision: "allow" | "deny";
  permission_key: string;
  subject_id: string;
  scope_type: string;
  organization_id: string | null;
  organization_unit_id: string | null;
  reason: string;
  matched_role_bindings: string[];
  matched_grants: string[];
  matched_denials: string[];
  risk_level: AccessDecisionRiskLevel;
  requires_audit: boolean;
  cache_status: string;
}
