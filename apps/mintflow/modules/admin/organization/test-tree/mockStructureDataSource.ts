import type { QueryParams } from "@peppermint/admin";

import type {
  Organization,
  OrganizationListResponse,
  OrganizationMembership,
  OrganizationUnit,
  UnitMember,
  UnitMembership,
  UnitMutationResult,
  UnitParentPatch,
  UnitSearchResult,
  UnitTreeNodeFlat,
} from "../_shared/organization.types";
import type {
  CreateUnitPayload,
  MoveUnitPayload,
  StructureDataSource,
  UpdateUnitPayload,
} from "../_shared/structure-data";
import type { CreateUnitMembershipPayload } from "../members/members.api";
import { buildSeed, TEST_ORG_ID, type Seed } from "./testSeed";

const READ_LATENCY_MS = 160;
const WRITE_LATENCY_MS = 240;

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));
const clone = <T>(value: T): T => structuredClone(value);
const nowIso = () => new Date().toISOString();

/** An axios-shaped error so `getApiError`/`getApiErrorMessage` map the code to copy. */
function apiError(code: string, message: string): unknown {
  return { response: { data: { error: { code, message } } } };
}

export interface MockStructureDataSource {
  dataSource: StructureDataSource;
  /** Re-seed the in-memory model (backs the test-tree's Reset button). */
  reset: () => void;
}

/**
 * An in-memory `StructureDataSource` — the whole Structure Builder canvas driven off
 * a mutable seed with no backend. Reads/writes carry small artificial latency so the
 * canvas's loading and pending states are exercised. Mutations return the same
 * `UnitMutationResult` shape the real API does, so the existing cache-patching logic
 * (`applyUnitMutationResult`) works unchanged.
 */
export function createMockStructureDataSource(): MockStructureDataSource {
  let state: Seed = buildSeed();
  // Bumped by reset(). A write captures the generation before its latency `await`
  // and re-checks after, so a mutation in flight during a Reset can't land on the
  // fresh seed (which would resurrect discarded changes).
  let generation = 0;
  const guardGeneration = (captured: number) => {
    if (captured !== generation) {
      throw apiError(
        "TEST_TREE_RESET",
        "The playground was reset while this action was in flight. Try again.",
      );
    }
  };

  const findUnit = (id: string) => state.units.find((u) => u.id === id);
  const childrenOf = (id: string | null) =>
    state.units
      .filter((u) => u.parent === id)
      .sort((a, b) => a.sort_order - b.sort_order);
  const directMembersOf = (id: string) =>
    state.unitMembers.filter((m) => m.unitId === id);

  function descendantsOf(id: string): OrganizationUnit[] {
    const out: OrganizationUnit[] = [];
    const queue = [...childrenOf(id)];
    while (queue.length > 0) {
      const unit = queue.shift()!;
      out.push(unit);
      queue.push(...childrenOf(unit.id));
    }
    return out;
  }

  /** Root→parent ancestor chain (excludes the unit itself). */
  function ancestorsOf(unit: OrganizationUnit): OrganizationUnit[] {
    const chain: OrganizationUnit[] = [];
    let current = unit.parent ? findUnit(unit.parent) : undefined;
    while (current) {
      chain.unshift(current);
      current = current.parent ? findUnit(current.parent) : undefined;
    }
    return chain;
  }

  const toUnitMember = (m: Seed["unitMembers"][number]): UnitMember => ({
    // The unique per-placement id, NOT the org-membership id — the canvas derives a
    // ReactFlow node id from this, so it must be unique per member node (the same
    // person can appear in more than one unit).
    membership_id: m.id,
    user_id: m.userId,
    username: m.username,
    display_name: m.displayName,
    membership_type: m.membershipType,
    is_primary: m.isPrimary,
  });

  function toFlat(
    unit: OrganizationUnit,
    includeMembers: boolean,
  ): UnitTreeNodeFlat {
    const kids = childrenOf(unit.id);
    const members = directMembersOf(unit.id);
    const node: UnitTreeNodeFlat = {
      id: unit.id,
      parent_id: unit.parent,
      name_np: unit.name_np,
      name_en: unit.name_en,
      code: unit.code,
      unit_type: unit.unit_type,
      status: unit.status,
      depth: unit.depth,
      sort_order: unit.sort_order,
      path_cache: unit.path_cache,
      is_operational: unit.is_operational,
      is_active: unit.is_active,
      has_children: kids.length > 0,
      child_count: kids.length,
      member_count: members.length,
      position_count: 0,
      descendant_count: descendantsOf(unit.id).length,
    };
    if (includeMembers) node.unit_members = members.map(toUnitMember);
    return node;
  }

  const parentPatch = (id: string): UnitParentPatch => {
    const kids = childrenOf(id);
    return { id, has_children: kids.length > 0, child_count: kids.length };
  };

  /** Recompute depth + path_cache for a unit and its whole subtree after a move. */
  function recomputeSubtree(unit: OrganizationUnit) {
    const parent = unit.parent ? findUnit(unit.parent) : null;
    unit.depth = parent ? parent.depth + 1 : 0;
    unit.path_cache = parent
      ? `${parent.path_cache}/${unit.code}`
      : `/${unit.code}`;
    for (const kid of childrenOf(unit.id)) recomputeSubtree(kid);
  }

  const dataSource: StructureDataSource = {
    async fetchOrganization(): Promise<Organization> {
      await delay(READ_LATENCY_MS);
      return clone(state.org);
    },

    async fetchUnitRoots(): Promise<UnitTreeNodeFlat[]> {
      await delay(READ_LATENCY_MS);
      return childrenOf(null).map((u) => toFlat(u, false));
    },

    async fetchUnitChildren(
      _organizationId: string,
      unitId: string,
    ): Promise<UnitTreeNodeFlat[]> {
      await delay(READ_LATENCY_MS);
      const unit = findUnit(unitId);
      if (!unit) {
        throw apiError("ORGANIZATION_UNIT_NOT_FOUND", "Unit not found.");
      }
      return [
        toFlat(unit, true),
        ...childrenOf(unitId).map((k) => toFlat(k, true)),
      ];
    },

    async fetchUnitsFlat(): Promise<OrganizationUnit[]> {
      await delay(READ_LATENCY_MS);
      return state.units
        .slice()
        .sort((a, b) => a.path_cache.localeCompare(b.path_cache))
        .map(clone);
    },

    async searchUnits(
      _organizationId: string,
      query: string,
      options?: { limit?: number },
    ): Promise<UnitSearchResult[]> {
      await delay(READ_LATENCY_MS);
      const term = query.trim().toLowerCase();
      if (!term) return [];
      return state.units
        .filter(
          (u) =>
            u.name_np.toLowerCase().includes(term) ||
            u.name_en.toLowerCase().includes(term) ||
            u.code.toLowerCase().includes(term),
        )
        .slice(0, options?.limit ?? 20)
        .map((u) => ({
          id: u.id,
          name_np: u.name_np,
          name_en: u.name_en,
          code: u.code,
          unit_type: u.unit_type,
          depth: u.depth,
          path: ancestorsOf(u).map((a) => ({
            id: a.id,
            name_np: a.name_np,
            name_en: a.name_en,
          })),
        }));
    },

    async fetchUnitDetail(unitId: string): Promise<OrganizationUnit> {
      await delay(READ_LATENCY_MS);
      const unit = findUnit(unitId);
      if (!unit) {
        throw apiError("ORGANIZATION_UNIT_NOT_FOUND", "Unit not found.");
      }
      return clone(unit);
    },

    async fetchUnitAncestors(unitId: string): Promise<OrganizationUnit[]> {
      await delay(READ_LATENCY_MS);
      const unit = findUnit(unitId);
      return unit ? ancestorsOf(unit).map(clone) : [];
    },

    async fetchUnitDescendants(unitId: string): Promise<OrganizationUnit[]> {
      await delay(READ_LATENCY_MS);
      return descendantsOf(unitId).map(clone);
    },

    async createUnit(
      organizationId: string,
      payload: CreateUnitPayload,
    ): Promise<UnitMutationResult> {
      const gen = generation;
      await delay(WRITE_LATENCY_MS);
      guardGeneration(gen);
      if (
        state.units.some(
          (u) => u.code.toLowerCase() === payload.code.toLowerCase(),
        )
      ) {
        throw apiError(
          "ORGANIZATION_UNIT_CODE_EXISTS",
          "That unit code is already in use.",
        );
      }
      const parent = payload.parent ? findUnit(payload.parent) : null;
      if (payload.parent && !parent) {
        throw apiError("ORGANIZATION_UNIT_NOT_FOUND", "Parent unit not found.");
      }
      const now = nowIso();
      const unit: OrganizationUnit = {
        id: crypto.randomUUID(),
        organization: organizationId,
        parent: payload.parent,
        name_np: payload.name_np,
        name_en: payload.name_en ?? "",
        name_romanized: payload.code.toLowerCase(),
        code: payload.code,
        unit_type: payload.unit_type,
        status: "draft",
        description: payload.description ?? "",
        sort_order: payload.sort_order ?? state.units.length,
        depth: parent ? parent.depth + 1 : 0,
        path_cache: parent
          ? `${parent.path_cache}/${payload.code}`
          : `/${payload.code}`,
        is_operational: payload.is_operational ?? true,
        is_active: false,
        effective_from: now,
        effective_to: null,
        metadata: {},
        created_at: now,
        updated_at: now,
      };
      state.units.push(unit);
      return {
        node: toFlat(unit, true),
        affected_parents: parent ? [parentPatch(parent.id)] : [],
      };
    },

    async updateUnit(
      unitId: string,
      payload: UpdateUnitPayload,
    ): Promise<UnitMutationResult> {
      const gen = generation;
      await delay(WRITE_LATENCY_MS);
      guardGeneration(gen);
      const unit = findUnit(unitId);
      if (!unit) {
        throw apiError("ORGANIZATION_UNIT_NOT_FOUND", "Unit not found.");
      }
      unit.name_np = payload.name_np ?? unit.name_np;
      unit.name_en = payload.name_en ?? unit.name_en;
      unit.unit_type = payload.unit_type ?? unit.unit_type;
      unit.status = payload.status ?? unit.status;
      unit.description = payload.description ?? unit.description;
      unit.sort_order = payload.sort_order ?? unit.sort_order;
      unit.is_operational = payload.is_operational ?? unit.is_operational;
      unit.is_active = unit.status === "active";
      unit.updated_at = nowIso();
      return { node: toFlat(unit, true), affected_parents: [] };
    },

    async moveUnit(
      unitId: string,
      payload: MoveUnitPayload,
    ): Promise<UnitMutationResult> {
      const gen = generation;
      await delay(WRITE_LATENCY_MS);
      guardGeneration(gen);
      const unit = findUnit(unitId);
      if (!unit) {
        throw apiError("ORGANIZATION_UNIT_NOT_FOUND", "Unit not found.");
      }
      const newParentId = payload.new_parent;
      if (newParentId) {
        const cycles =
          newParentId === unitId ||
          descendantsOf(unitId).some((d) => d.id === newParentId);
        if (cycles) {
          throw apiError(
            "ORGANIZATION_UNIT_CYCLE_DETECTED",
            "A unit can't be moved under itself or one of its descendants.",
          );
        }
        if (!findUnit(newParentId)) {
          throw apiError(
            "ORGANIZATION_UNIT_NOT_FOUND",
            "Target parent not found.",
          );
        }
      }
      const oldParentId = unit.parent;
      unit.parent = newParentId;
      unit.updated_at = nowIso();
      recomputeSubtree(unit);

      const affected: UnitParentPatch[] = [];
      if (oldParentId && findUnit(oldParentId)) {
        affected.push(parentPatch(oldParentId));
      }
      if (newParentId) affected.push(parentPatch(newParentId));
      return { node: toFlat(unit, true), affected_parents: affected };
    },

    async deactivateUnit(unitId: string): Promise<UnitMutationResult> {
      const gen = generation;
      await delay(WRITE_LATENCY_MS);
      guardGeneration(gen);
      const unit = findUnit(unitId);
      if (!unit) {
        throw apiError("ORGANIZATION_UNIT_NOT_FOUND", "Unit not found.");
      }
      if (childrenOf(unitId).some((c) => c.status === "active")) {
        throw apiError(
          "ORGANIZATION_UNIT_HAS_ACTIVE_CHILDREN",
          "This unit still has active child units.",
        );
      }
      unit.status = "inactive";
      unit.is_active = false;
      unit.updated_at = nowIso();
      return { node: toFlat(unit, true), affected_parents: [] };
    },

    async fetchMemberships(
      _organizationId: string,
      params?: QueryParams,
    ): Promise<OrganizationListResponse<OrganizationMembership>> {
      await delay(READ_LATENCY_MS);
      const page = params?.page ?? 1;
      const pageSize = params?.pageSize ?? 100;
      const search = (params?.search ?? "").toLowerCase();
      const filtered = search
        ? state.memberships.filter((m) =>
            m.employee_code.toLowerCase().includes(search),
          )
        : state.memberships;
      const start = (page - 1) * pageSize;
      const data = filtered.slice(start, start + pageSize).map(clone);
      return {
        data,
        meta: {
          count: filtered.length,
          total: filtered.length,
          page,
          page_size: pageSize,
          next: start + pageSize < filtered.length ? "next" : null,
          previous: page > 1 ? "prev" : null,
        },
      };
    },

    async createUnitMembership(
      membershipId: string,
      payload: CreateUnitMembershipPayload,
    ): Promise<UnitMembership> {
      const gen = generation;
      await delay(WRITE_LATENCY_MS);
      guardGeneration(gen);
      const membership = state.memberships.find((m) => m.id === membershipId);
      if (!membership) {
        throw apiError(
          "ORGANIZATION_MEMBERSHIP_NOT_FOUND",
          "Membership not found.",
        );
      }
      if (!findUnit(payload.unit_id)) {
        throw apiError("ORGANIZATION_UNIT_NOT_FOUND", "Unit not found.");
      }
      if (
        state.unitMembers.some(
          (m) =>
            m.membershipId === membershipId && m.unitId === payload.unit_id,
        )
      ) {
        // Custom code (not in the error dictionary) so the friendly message shows.
        throw apiError(
          "ORGANIZATION_UNIT_MEMBERSHIP_EXISTS",
          "This member is already placed in this unit.",
        );
      }
      const person = state.people[membership.user];
      const now = nowIso();
      const id = crypto.randomUUID();
      state.unitMembers.push({
        id,
        membershipId,
        unitId: payload.unit_id,
        userId: membership.user,
        displayName: person.displayName,
        username: person.username,
        membershipType: payload.membership_type ?? "staff",
        isPrimary: payload.is_primary ?? false,
      });
      return {
        id,
        organization: TEST_ORG_ID,
        membership: membershipId,
        unit: payload.unit_id,
        membership_type: payload.membership_type ?? "staff",
        status: "active",
        is_primary: payload.is_primary ?? false,
        valid_from: payload.valid_from ?? now,
        valid_to: payload.valid_to ?? null,
        reason: payload.reason ?? "",
        metadata: {},
        created_at: now,
        updated_at: now,
      };
    },
  };

  return {
    dataSource,
    reset: () => {
      generation += 1;
      state = buildSeed();
    },
  };
}
