// Mock API — replace with real Axios calls when backend is wired.
// Real endpoints:
//   GET  /api/v1/organization/organizations/<org_id>/delegations/
//   POST /api/v1/organization/organizations/<org_id>/delegations/
//          body: { from_assignment_id, to_assignment_id, delegation_type, status?,
//                  scope_unit?, starts_at, ends_at?, reason }
//   POST /api/v1/organization/delegations/<id>/revoke/
//          body: { reason }
import type { QueryParams } from "@peppermint/admin";
import type {
  AssignmentOption,
  Delegation,
  DelegationCreatePayload,
  DelegationsFetchResponse,
  RevokePayload,
} from "./delegations.types";

const MOCK_ORG_ID = "11111111-1111-4111-8111-111111111111";

const MOCK_DELEGATIONS: Delegation[] = [
  {
    id: "del-001",
    organization: MOCK_ORG_ID,
    from_assignment: "asgn-dg-001",
    to_assignment: "asgn-ddg-001",
    from_assignment_label: "Director General (pos-001)",
    to_assignment_label: "Deputy Director General (pos-002)",
    delegation_type: "acting_authority",
    status: "active",
    scope_unit: null,
    starts_at: "2026-06-01T00:00:00Z",
    ends_at: "2026-07-01T00:00:00Z",
    reason: "Director General on annual leave.",
    approved_by: null,
    revoked_by: null,
    revoked_at: null,
    revocation_reason: "",
    metadata: {},
    created_at: "2026-05-28T09:00:00Z",
    updated_at: "2026-05-28T09:00:00Z",
  },
  {
    id: "del-002",
    organization: MOCK_ORG_ID,
    from_assignment: "asgn-sho-001",
    to_assignment: "asgn-da-001",
    from_assignment_label: "Senior Health Officer (pos-002)",
    to_assignment_label: "Data Analyst (pos-003)",
    delegation_type: "temporary_supervision",
    status: "planned",
    scope_unit: null,
    starts_at: "2026-07-15T00:00:00Z",
    ends_at: null,
    reason: "Covering programme data oversight while analyst is onboarding.",
    approved_by: null,
    revoked_by: null,
    revoked_at: null,
    revocation_reason: "",
    metadata: {},
    created_at: "2026-06-20T09:00:00Z",
    updated_at: "2026-06-20T09:00:00Z",
  },
  {
    id: "del-003",
    organization: MOCK_ORG_ID,
    from_assignment: "asgn-dg-001",
    to_assignment: "asgn-sho-001",
    from_assignment_label: "Director General (pos-001)",
    to_assignment_label: "Senior Health Officer (pos-002)",
    delegation_type: "approval_substitution",
    status: "revoked",
    scope_unit: null,
    starts_at: "2026-03-01T00:00:00Z",
    ends_at: "2026-04-01T00:00:00Z",
    reason: "Travel delegation for regional conference.",
    approved_by: null,
    revoked_by: null,
    revoked_at: "2026-03-20T12:00:00Z",
    revocation_reason: "Returned early from conference.",
    metadata: {},
    created_at: "2026-02-25T09:00:00Z",
    updated_at: "2026-03-20T12:00:00Z",
  },
];

const MOCK_ASSIGNMENT_OPTIONS: AssignmentOption[] = [
  {
    id: "asgn-dg-001",
    title: "Director General",
    code: "dg-001",
    unitName: "Executive Office",
    unitId: "unit-aaa-111",
  },
  {
    id: "asgn-ddg-001",
    title: "Deputy Director General",
    code: "ddg-001",
    unitName: "Executive Office",
    unitId: "unit-aaa-111",
  },
  {
    id: "asgn-sho-001",
    title: "Senior Health Officer",
    code: "sho-001",
    unitName: "Health Programmes",
    unitId: "unit-aaa-111",
  },
  {
    id: "asgn-da-001",
    title: "Data Analyst",
    code: "da-001",
    unitName: "Data & Analytics",
    unitId: "unit-bbb-222",
  },
  {
    id: "asgn-fc-001",
    title: "Field Coordinator",
    code: "fc-001",
    unitName: "Field Operations",
    unitId: "unit-bbb-222",
  },
];

function delay(ms = 250) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function paginate<T>(items: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export async function fetchDelegations(
  orgId: string,
  params?: QueryParams,
): Promise<DelegationsFetchResponse> {
  await delay();
  let data = MOCK_DELEGATIONS.filter((d) => d.organization === orgId);
  const statusFilter = params?.filters?.status as string | undefined;
  if (statusFilter) {
    data = data.filter((d) => d.status === statusFilter);
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    data = data.filter(
      (d) =>
        d.reason.toLowerCase().includes(q) ||
        (d.from_assignment_label ?? "").toLowerCase().includes(q) ||
        (d.to_assignment_label ?? "").toLowerCase().includes(q),
    );
  }
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 20;
  return {
    data: paginate(data, page, pageSize),
    meta: { total: data.length, page, pageSize },
  };
}

export async function createDelegation(
  orgId: string,
  payload: DelegationCreatePayload,
): Promise<Delegation> {
  await delay(350);
  void orgId;
  const fromOpt = MOCK_ASSIGNMENT_OPTIONS.find(
    (a) => a.id === payload.from_assignment_id,
  );
  const toOpt = MOCK_ASSIGNMENT_OPTIONS.find(
    (a) => a.id === payload.to_assignment_id,
  );
  const newDelegation: Delegation = {
    id: `del-${Date.now()}`,
    organization: orgId,
    from_assignment: payload.from_assignment_id,
    to_assignment: payload.to_assignment_id,
    from_assignment_label: fromOpt
      ? `${fromOpt.title} (${fromOpt.code})`
      : payload.from_assignment_id,
    to_assignment_label: toOpt
      ? `${toOpt.title} (${toOpt.code})`
      : payload.to_assignment_id,
    delegation_type: payload.delegation_type,
    status: payload.status ?? "planned",
    scope_unit: payload.scope_unit ?? null,
    starts_at: payload.starts_at,
    ends_at: payload.ends_at ?? null,
    reason: payload.reason,
    approved_by: null,
    revoked_by: null,
    revoked_at: null,
    revocation_reason: "",
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  MOCK_DELEGATIONS.push(newDelegation);
  return newDelegation;
}

export async function revokeDelegation(
  id: string,
  payload: RevokePayload,
): Promise<Delegation> {
  await delay(300);
  void payload;
  const del = MOCK_DELEGATIONS.find((d) => d.id === id);
  return {
    ...del,
    id,
    status: "revoked",
    revoked_at: new Date().toISOString(),
    revocation_reason: payload.reason,
    updated_at: new Date().toISOString(),
  } as Delegation;
}

export async function fetchAssignmentOptions(
  search: string,
): Promise<AssignmentOption[]> {
  await delay(150);
  if (!search) return MOCK_ASSIGNMENT_OPTIONS;
  const q = search.toLowerCase();
  return MOCK_ASSIGNMENT_OPTIONS.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.code.toLowerCase().includes(q) ||
      (a.unitName ?? "").toLowerCase().includes(q),
  );
}
