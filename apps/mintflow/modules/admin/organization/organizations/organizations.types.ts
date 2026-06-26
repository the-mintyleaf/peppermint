import type {
  OrganizationStatus,
  OrganizationType,
} from "../organization.types";

export type { OrganizationStatus, OrganizationType };

export interface Organization extends Record<string, unknown> {
  id: string;
  name: string;
  code: string;
  organization_type: OrganizationType;
  status: OrganizationStatus;
  parent_organization: string | null;
  legal_name: string;
  short_name: string;
  description: string;
  country_code: string;
  timezone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationsFetchResponse {
  data: Organization[];
  meta: { total: number; page: number; pageSize: number };
}

export interface ChangeStatusPayload {
  status: OrganizationStatus;
  reason: string;
}
