import type { QueryParams } from "@peppermint/admin";

import type { CreateUnitMembershipPayload } from "../../members/members.api";
import type {
  Organization,
  OrganizationListResponse,
  OrganizationMembership,
  OrganizationUnit,
  UnitMembership,
  UnitMutationResult,
  UnitSearchResult,
  UnitTreeNodeFlat,
  UnitType,
} from "../organization.types";

// Unit CRUD payloads. Canonical home for these — `structure/Structure.api.ts`
// re-exports them for back-compat with existing importers.

export interface CreateUnitPayload {
  name_np: string;
  name_en?: string;
  code: string;
  unit_type: UnitType;
  parent: string | null;
  description?: string;
  sort_order?: number;
  is_operational?: boolean;
}

/** Never send `code` or `parent` through update — use `moveUnit` for re-parenting. */
export interface UpdateUnitPayload {
  name_np?: string;
  name_en?: string;
  unit_type?: UnitType;
  status?: OrganizationUnit["status"];
  description?: string;
  sort_order?: number;
  is_operational?: boolean;
}

export interface MoveUnitPayload {
  new_parent: string | null;
  reason: string;
}

export interface DeactivateUnitPayload {
  reason?: string;
}

/**
 * Every data call the Structure Builder canvas makes, behind one interface so the
 * canvas can be driven by the real axios backend or an in-memory mock without any
 * change to the canvas, its hooks, or its components. Method shapes mirror the
 * existing `*.api.ts` functions exactly — see `realStructureDataSource.ts`.
 */
export interface StructureDataSource {
  fetchOrganization(organizationId: string): Promise<Organization>;
  fetchUnitRoots(organizationId: string): Promise<UnitTreeNodeFlat[]>;
  fetchUnitChildren(
    organizationId: string,
    unitId: string,
  ): Promise<UnitTreeNodeFlat[]>;
  fetchUnitsFlat(organizationId: string): Promise<OrganizationUnit[]>;
  searchUnits(
    organizationId: string,
    query: string,
    options?: { limit?: number },
  ): Promise<UnitSearchResult[]>;
  fetchUnitDetail(unitId: string): Promise<OrganizationUnit>;
  fetchUnitAncestors(unitId: string): Promise<OrganizationUnit[]>;
  fetchUnitDescendants(unitId: string): Promise<OrganizationUnit[]>;
  createUnit(
    organizationId: string,
    payload: CreateUnitPayload,
  ): Promise<UnitMutationResult>;
  updateUnit(
    unitId: string,
    payload: UpdateUnitPayload,
  ): Promise<UnitMutationResult>;
  moveUnit(
    unitId: string,
    payload: MoveUnitPayload,
  ): Promise<UnitMutationResult>;
  deactivateUnit(
    unitId: string,
    payload: DeactivateUnitPayload,
  ): Promise<UnitMutationResult>;
  fetchMemberships(
    organizationId: string,
    params?: QueryParams,
  ): Promise<OrganizationListResponse<OrganizationMembership>>;
  createUnitMembership(
    membershipId: string,
    payload: CreateUnitMembershipPayload,
  ): Promise<UnitMembership>;
}
