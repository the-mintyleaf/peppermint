import type {
  MembershipStatus,
  OrganizationType,
} from "@/modules/admin/organization/_shared/organization.types";

/** Organization summary carried on a "my membership" row. */
export interface MyMembershipOrganization {
  id: string;
  name_np: string;
  name_en: string;
  code: string;
  organization_type: OrganizationType;
}

/**
 * The current user's own membership, as returned by
 * `GET /api/v1/organization/memberships/mine/`. Field shape assumed from the
 * backend spec (org name/code/type, employee code, invited-at) — adjust here if
 * the real response differs.
 */
export interface MyMembership {
  id: string;
  organization: MyMembershipOrganization;
  employee_code: string;
  membership_status: MembershipStatus;
  invited_at: string | null;
  is_primary: boolean;
}
